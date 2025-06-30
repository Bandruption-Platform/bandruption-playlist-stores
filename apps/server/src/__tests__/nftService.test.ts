import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import algosdk from 'algosdk';
import axios from 'axios';
import FormData from 'form-data';

// Mock dependencies
vi.mock('algosdk');
vi.mock('axios');

const mockAxios = vi.mocked(axios);
const mockAlgosdk = vi.mocked(algosdk);

// Mock algorandService
const mockAlgorandService = {
  getTransactionParams: vi.fn().mockResolvedValue({ fee: 1000, firstRound: 1000, lastRound: 2000 }),
  sendRawTransaction: vi.fn().mockResolvedValue({ txid: 'test-tx-id' }),
  waitForConfirmation: vi.fn().mockResolvedValue({ confirmedRound: 1001, assetIndex: 123 })
};

vi.mock('../services/algorandService.js', () => ({
  algorandService: mockAlgorandService
}));

// Mock walletService
const mockWalletService = {
  getWalletByUserId: vi.fn(),
  getAccountFromWallet: vi.fn().mockResolvedValue({
    addr: 'TESTADDRESS123',
    sk: new Uint8Array([1, 2, 3])
  })
};

vi.mock('../services/walletService.js', () => ({
  walletService: mockWalletService
}));

// Mock supabase
const createMockSupabaseChain = () => {
  const chainMock = {
    from: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null })
  };
  
  // Make all methods return the chain mock to enable chaining
  chainMock.from.mockReturnValue(chainMock);
  chainMock.insert.mockReturnValue(chainMock);
  chainMock.select.mockReturnValue(chainMock);
  chainMock.update.mockReturnValue(chainMock);
  chainMock.eq.mockReturnValue(chainMock);
  
  return chainMock;
};

const mockSupabase = createMockSupabaseChain();

vi.mock('@shared/supabase', () => ({
  supabase: mockSupabase
}));

describe('NFTService', () => {
  let NFTService: any;
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset supabase mock chains
    Object.assign(mockSupabase, createMockSupabaseChain());
    
    // Set environment variables
    process.env.PINATA_API_KEY = 'test-pinata-key';
    process.env.PINATA_SECRET = 'test-pinata-secret';
    
    // Mock algosdk functions
    const mockTxn = { signTxn: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])) };
    mockAlgosdk.makeAssetCreateTxnWithSuggestedParamsFromObject = vi.fn().mockReturnValue(mockTxn);
    mockAlgosdk.makePaymentTxnWithSuggestedParamsFromObject = vi.fn().mockReturnValue(mockTxn);
    mockAlgosdk.makeAssetTransferTxnWithSuggestedParamsFromObject = vi.fn().mockReturnValue(mockTxn);
    mockAlgosdk.assignGroupID = vi.fn();
    
    // Mock axios responses
    (mockAxios.post as any).mockResolvedValue({
      data: { IpfsHash: 'QmTestHash123' }
    });
    
    // Dynamic import to get fresh instance
    const module = await import('../services/nftService.js');
    NFTService = module.nftService.constructor;
    service = new NFTService();
  });

  afterEach(() => {
    delete process.env.PINATA_API_KEY;
    delete process.env.PINATA_SECRET;
  });

  describe('mintNFT', () => {
    const mockMintParams = {
      userId: 'test-user-id',
      name: 'Test NFT',
      description: 'A test NFT',
      imageFile: Buffer.from('test image data'),
      metadata: { type: 'art' }
    };

    beforeEach(() => {
      mockWalletService.getWalletByUserId.mockResolvedValue({
        id: 'wallet-123',
        address: 'TESTADDRESS123'
      });
      
      mockSupabase.single.mockResolvedValue({
        data: { id: 'nft-123', asset_id: 123 },
        error: null
      });
    });

    it('should successfully mint an NFT', async () => {
      const result = await service.mintNFT(mockMintParams);
      
      // Verify wallet retrieval
      expect(mockWalletService.getWalletByUserId).toHaveBeenCalledWith('test-user-id');
      expect(mockWalletService.getAccountFromWallet).toHaveBeenCalledWith('wallet-123');
      
      // Verify IPFS uploads (image and metadata)
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
      
      // Verify asset creation transaction
      expect(mockAlgosdk.makeAssetCreateTxnWithSuggestedParamsFromObject).toHaveBeenCalledWith({
        sender: 'TESTADDRESS123',
        total: 1,
        decimals: 0,
        assetName: 'Test NFT',
        unitName: 'NFT',
        assetURL: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        assetMetadataHash: undefined,
        defaultFrozen: false,
        freeze: 'TESTADDRESS123',
        manager: 'TESTADDRESS123',
        clawback: undefined,
        reserve: 'TESTADDRESS123',
        suggestedParams: { fee: 1000, firstRound: 1000, lastRound: 2000 }
      });
      
      // Verify database insertion
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        asset_id: 123,
        name: 'Test NFT',
        description: 'A test NFT',
        image_url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        metadata_url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        creator_address: 'TESTADDRESS123',
        current_owner_address: 'TESTADDRESS123'
      });
      
      expect(result).toEqual({
        assetId: 123,
        txId: 'test-tx-id',
        nft: { id: 'nft-123', asset_id: 123 }
      });
    });

    it('should throw error if user has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      await expect(service.mintNFT(mockMintParams)).rejects.toThrow('User does not have a wallet');
    });

    it('should handle metadata correctly when not provided', async () => {
      const paramsWithoutMetadata = { ...mockMintParams } as any;
      delete paramsWithoutMetadata.metadata;
      
      await service.mintNFT(paramsWithoutMetadata);
      
      // Check that mintNFT was called and completed
      expect(service.mintNFT).toBeDefined();
      // Verify axios was called twice (image and metadata)
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('buyNFT', () => {
    const mockBuyParams = {
      buyerUserId: 'buyer-user-id',
      nftId: 'nft-123',
      priceInMicroAlgos: 1000000
    };

    beforeEach(() => {
      mockWalletService.getWalletByUserId.mockResolvedValue({
        id: 'buyer-wallet-123',
        address: 'BUYERADDRESS123'
      });
    });

    it('should throw error for buying feature not fully implemented', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'nft-123',
          for_sale: true,
          current_owner_address: 'SELLERADDRESS123',
          asset_id: 456
        },
        error: null
      });
      
      await expect(service.buyNFT(mockBuyParams)).rejects.toThrow('NFT buying requires seller signature - not implemented in this demo');
    });

    it('should throw error if NFT is not for sale', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'nft-123',
          for_sale: false,
          current_owner_address: 'SELLERADDRESS123'
        },
        error: null
      });
      
      await expect(service.buyNFT(mockBuyParams)).rejects.toThrow('NFT is not for sale');
    });

    it('should throw error if buyer tries to buy their own NFT', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'nft-123',
          for_sale: true,
          current_owner_address: 'BUYERADDRESS123'
        },
        error: null
      });
      
      await expect(service.buyNFT(mockBuyParams)).rejects.toThrow('Cannot buy your own NFT');
    });

    it('should throw error if buyer has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      await expect(service.buyNFT(mockBuyParams)).rejects.toThrow('Buyer does not have a wallet');
    });
  });

  describe('transferNFT', () => {
    const mockTransferParams = {
      fromUserId: 'sender-user-id',
      toAddress: 'RECIPIENTADDRESS123',
      assetId: 456
    };

    it('should throw error if sender has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      await expect(service.transferNFT(mockTransferParams)).rejects.toThrow('Sender does not have a wallet');
    });
  });

  describe('listNFTForSale', () => {
    const mockListParams = {
      userId: 'user-123',
      nftId: 'nft-123',
      priceInMicroAlgos: 2000000
    };

    it('should throw error if user has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      await expect(service.listNFTForSale(mockListParams)).rejects.toThrow('User does not have a wallet');
    });
  });

  describe('removeNFTFromSale', () => {
    const mockRemoveParams = {
      userId: 'user-123',
      nftId: 'nft-123'
    };

    it('should throw error if user has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      await expect(service.removeNFTFromSale(mockRemoveParams)).rejects.toThrow('User does not have a wallet');
    });
  });

  describe('getUserNFTs', () => {
    it('should return user NFTs', async () => {
      const userId = 'user-123';
      const mockNFTs = [{ id: 'nft-1' }, { id: 'nft-2' }];
      
      mockWalletService.getWalletByUserId.mockResolvedValue({
        address: 'USERADDRESS123'
      });
      mockSupabase.eq.mockResolvedValue({ data: mockNFTs, error: null });
      
      const result = await service.getUserNFTs(userId);
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('current_owner_address', 'USERADDRESS123');
      expect(result).toEqual(mockNFTs);
    });

    it('should return empty array if user has no wallet', async () => {
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      
      const result = await service.getUserNFTs('user-123');
      
      expect(result).toEqual([]);
    });
  });

  describe('getNFTsForSale', () => {
    it('should return NFTs for sale', async () => {
      const mockNFTs = [{ id: 'nft-1', for_sale: true }];
      
      mockSupabase.eq.mockResolvedValue({ data: mockNFTs, error: null });
      
      const result = await service.getNFTsForSale();
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('for_sale', true);
      expect(result).toEqual(mockNFTs);
    });
  });

  describe('uploadToIPFS', () => {
    it('should upload file to IPFS via Pinata', async () => {
      const buffer = Buffer.from('test data');
      const filename = 'test.json';
      
      const result = await service.uploadToIPFS(buffer, filename);
      
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        expect.any(FormData),
        {
          headers: expect.objectContaining({
            'pinata_api_key': 'test-pinata-key',
            'pinata_secret_api_key': 'test-pinata-secret'
          })
        }
      );
      expect(result).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123');
    });

    it('should throw error when PINATA_API_KEY is missing', async () => {
      delete process.env.PINATA_API_KEY;
      
      const buffer = Buffer.from('test data');
      const filename = 'test.json';
      
      await expect(service.uploadToIPFS(buffer, filename)).rejects.toThrow(
        'PINATA_API_KEY and PINATA_SECRET environment variables are required'
      );
    });

    it('should throw error when PINATA_SECRET is missing', async () => {
      delete process.env.PINATA_SECRET;
      
      const buffer = Buffer.from('test data');
      const filename = 'test.json';
      
      await expect(service.uploadToIPFS(buffer, filename)).rejects.toThrow(
        'PINATA_API_KEY and PINATA_SECRET environment variables are required'
      );
    });
  });

  describe('recordTransaction', () => {
    it('should record transaction in database', async () => {
      const mockParams = {
        nftId: 'nft-123',
        transactionId: 'tx-123',
        toAddress: 'ADDRESS123',
        transactionType: 'mint' as const,
        blockNumber: 1001
      };
      
      mockSupabase.insert.mockResolvedValue({ error: null });
      
      await service.recordTransaction(mockParams);
      
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        nft_id: 'nft-123',
        transaction_id: 'tx-123',
        from_address: undefined,
        to_address: 'ADDRESS123',
        transaction_type: 'mint',
        amount: undefined,
        block_number: 1001
      });
    });
  });
});