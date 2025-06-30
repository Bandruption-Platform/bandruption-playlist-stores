import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import algosdk from 'algosdk';

// Mock algosdk
vi.mock('algosdk');
const mockAlgosdk = vi.mocked(algosdk);

describe('AlgorandService', () => {
  let AlgorandService: any;
  let service: any;
  let mockAlgod: any;
  let mockIndexer: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock Algod client
    mockAlgod = {
      status: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ lastRound: 1000 }) }),
      accountInformation: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ amount: 5000000, assets: [] }) }),
      pendingTransactionInformation: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ confirmedRound: 1001 }) }),
      statusAfterBlock: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({}) }),
      getTransactionParams: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ fee: 1000, firstRound: 1000, lastRound: 2000, genesisHash: 'test' }) }),
      sendRawTransaction: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ txid: 'test-tx-id' }) }),
      getAssetByID: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ index: 123, params: { name: 'Test NFT' } }) })
    };

    // Mock Indexer client
    mockIndexer = {
      lookupTransactionByID: vi.fn().mockReturnValue({ do: vi.fn().mockResolvedValue({ transaction: { id: 'test-tx-id' } }) })
    };

    // Mock algosdk constructors
    mockAlgosdk.Algodv2 = vi.fn().mockImplementation(() => mockAlgod);
    mockAlgosdk.Indexer = vi.fn().mockImplementation(() => mockIndexer);
    
    // Set environment variables
    process.env.NODELY_API_URL = 'https://test-algod.com';
    process.env.NODELY_INDEXER_URL = 'https://test-indexer.com';
    
    // Dynamic import to get fresh instance with env vars
    const module = await import('../services/algorandService.js');
    AlgorandService = module.algorandService.constructor;
    service = new AlgorandService();
  });

  afterEach(() => {
    delete process.env.NODELY_API_URL;
    delete process.env.NODELY_INDEXER_URL;
  });

  describe('constructor', () => {
    it('should initialize Algod and Indexer clients with correct parameters', () => {
      expect(mockAlgosdk.Algodv2).toHaveBeenCalledWith('', 'https://test-algod.com', '');
      expect(mockAlgosdk.Indexer).toHaveBeenCalledWith('', 'https://test-indexer.com', '');
    });
  });

  describe('getNodeStatus', () => {
    it('should return node status', async () => {
      const result = await service.getNodeStatus();
      
      expect(mockAlgod.status).toHaveBeenCalled();
      expect(result).toEqual({ lastRound: 1000 });
    });
  });

  describe('getAccountInfo', () => {
    it('should return account information for given address', async () => {
      const address = 'TESTADDRESS123';
      const result = await service.getAccountInfo(address);
      
      expect(mockAlgod.accountInformation).toHaveBeenCalledWith(address);
      expect(result).toEqual({ amount: 5000000, assets: [] });
    });
  });

  describe('waitForConfirmation', () => {
    it('should return immediately if transaction is already confirmed', async () => {
      const txId = 'test-tx-id';
      mockAlgod.pendingTransactionInformation.mockReturnValueOnce({
        do: vi.fn().mockResolvedValue({ confirmedRound: 1001 })
      });

      const result = await service.waitForConfirmation(txId);
      
      expect(mockAlgod.pendingTransactionInformation).toHaveBeenCalledWith(txId);
      expect(result).toEqual({ confirmedRound: 1001 });
    });

    it('should wait for confirmation if transaction is pending', async () => {
      const txId = 'test-tx-id';
      let callCount = 0;
      
      // Mock status to return a round
      mockAlgod.status.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({ lastRound: 1000 }) 
      });
      
      // Mock statusAfterBlock
      mockAlgod.statusAfterBlock.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({}) 
      });
      
      // First two calls return pending, third call confirmed
      mockAlgod.pendingTransactionInformation.mockReturnValue({
        do: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount <= 2) {
            return Promise.resolve({ confirmedRound: 0 });
          } else {
            return Promise.resolve({ confirmedRound: 1001 });
          }
        })
      });

      const result = await service.waitForConfirmation(txId);
      
      expect(mockAlgod.pendingTransactionInformation).toHaveBeenCalledTimes(3);
      expect(mockAlgod.statusAfterBlock).toHaveBeenCalledTimes(1);
      expect(mockAlgod.statusAfterBlock).toHaveBeenCalledWith(1001);
      expect(result).toEqual({ confirmedRound: 1001 });
    });

    it('should throw error if transaction is not confirmed within retry limit', async () => {
      const txId = 'test-tx-id';
      const maxRetries = 3;
      
      // Mock status to return a round
      mockAlgod.status.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({ lastRound: 1000 }) 
      });
      
      // Mock statusAfterBlock
      mockAlgod.statusAfterBlock.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({}) 
      });
      
      // Always return pending transaction
      mockAlgod.pendingTransactionInformation.mockReturnValue({
        do: vi.fn().mockResolvedValue({ confirmedRound: 0 })
      });

      await expect(service.waitForConfirmation(txId, maxRetries)).rejects.toThrow(
        `Transaction ${txId} was not confirmed after ${maxRetries} rounds`
      );
      
      expect(mockAlgod.pendingTransactionInformation).toHaveBeenCalledTimes(maxRetries + 1); // Initial call + retries
      expect(mockAlgod.statusAfterBlock).toHaveBeenCalledTimes(maxRetries);
    });

    it('should use default retry limit of 100 if not specified', async () => {
      const txId = 'test-tx-id';
      
      // Mock status to return a round
      mockAlgod.status.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({ lastRound: 1000 }) 
      });
      
      // Mock statusAfterBlock
      mockAlgod.statusAfterBlock.mockReturnValue({ 
        do: vi.fn().mockResolvedValue({}) 
      });
      
      // Always return pending transaction
      mockAlgod.pendingTransactionInformation.mockReturnValue({
        do: vi.fn().mockResolvedValue({ confirmedRound: 0 })
      });

      await expect(service.waitForConfirmation(txId)).rejects.toThrow(
        `Transaction ${txId} was not confirmed after 100 rounds`
      );
      
      expect(mockAlgod.pendingTransactionInformation).toHaveBeenCalledTimes(101); // Initial call + 100 retries
      expect(mockAlgod.statusAfterBlock).toHaveBeenCalledTimes(100);
    });
  });

  describe('getTransactionParams', () => {
    it('should return transaction parameters', async () => {
      const result = await service.getTransactionParams();
      
      expect(mockAlgod.getTransactionParams).toHaveBeenCalled();
      expect(result).toEqual({ fee: 1000, firstRound: 1000, lastRound: 2000, genesisHash: 'test' });
    });
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction and return response', async () => {
      const signedTxn = new Uint8Array([1, 2, 3]);
      const result = await service.sendRawTransaction(signedTxn);
      
      expect(mockAlgod.sendRawTransaction).toHaveBeenCalledWith(signedTxn);
      expect(result).toEqual({ txid: 'test-tx-id' });
    });
  });

  describe('getAssetInfo', () => {
    it('should return asset information for given asset ID', async () => {
      const assetId = 123;
      const result = await service.getAssetInfo(assetId);
      
      expect(mockAlgod.getAssetByID).toHaveBeenCalledWith(assetId);
      expect(result).toEqual({ index: 123, params: { name: 'Test NFT' } });
    });
  });

  describe('getTransaction', () => {
    it('should return transaction information from indexer', async () => {
      const txId = 'test-tx-id';
      const result = await service.getTransaction(txId);
      
      expect(mockIndexer.lookupTransactionByID).toHaveBeenCalledWith(txId);
      expect(result).toEqual({ transaction: { id: 'test-tx-id' } });
    });
  });

  describe('getAccountAssets', () => {
    it('should return account assets', async () => {
      const address = 'TESTADDRESS123';
      const assets = [{ assetId: 123, amount: 1 }];
      
      mockAlgod.accountInformation.mockReturnValueOnce({
        do: vi.fn().mockResolvedValue({ amount: 5000000, assets })
      });

      const result = await service.getAccountAssets(address);
      
      expect(mockAlgod.accountInformation).toHaveBeenCalledWith(address);
      expect(result).toEqual(assets);
    });

    it('should return empty array if no assets', async () => {
      const address = 'TESTADDRESS123';
      
      mockAlgod.accountInformation.mockReturnValueOnce({
        do: vi.fn().mockResolvedValue({ amount: 5000000 })
      });

      const result = await service.getAccountAssets(address);
      
      expect(result).toEqual([]);
    });
  });

  describe('checkAccountExists', () => {
    it('should return true if account exists', async () => {
      const address = 'TESTADDRESS123';
      const result = await service.checkAccountExists(address);
      
      expect(mockAlgod.accountInformation).toHaveBeenCalledWith(address);
      expect(result).toBe(true);
    });

    it('should return false if account does not exist', async () => {
      const address = 'TESTADDRESS123';
      
      mockAlgod.accountInformation.mockReturnValueOnce({
        do: vi.fn().mockRejectedValue(new Error('account does not exist'))
      });

      const result = await service.checkAccountExists(address);
      
      expect(result).toBe(false);
    });

    it('should throw error for other errors', async () => {
      const address = 'TESTADDRESS123';
      
      mockAlgod.accountInformation.mockReturnValueOnce({
        do: vi.fn().mockRejectedValue(new Error('Network error'))
      });

      await expect(service.checkAccountExists(address)).rejects.toThrow('Network error');
    });
  });

  describe('client getters', () => {
    it('should return algod client', () => {
      const client = service.algodClient;
      expect(client).toBe(mockAlgod);
    });

    it('should return indexer client', () => {
      const client = service.indexerClient;
      expect(client).toBe(mockIndexer);
    });
  });
});