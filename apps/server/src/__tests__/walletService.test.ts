import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateAccount, mnemonicToSecretKey, secretKeyToMnemonic } from 'algosdk';
import crypto from 'crypto';

// Mock algosdk functions
vi.mock('algosdk', () => ({
  generateAccount: vi.fn(),
  mnemonicToSecretKey: vi.fn(),
  secretKeyToMnemonic: vi.fn()
}));

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(),
    createCipher: vi.fn(),
    createDecipher: vi.fn()
  }
}));

// Mock supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null })
};

vi.mock('@shared/supabase', () => ({
  supabase: mockSupabase
}));

describe('WalletService', () => {
  let WalletService: any;
  let service: any;
  const mockGenerateAccount = vi.mocked(generateAccount);
  const mockMnemonicToSecretKey = vi.mocked(mnemonicToSecretKey);
  const mockSecretKeyToMnemonic = vi.mocked(secretKeyToMnemonic);
  const mockCrypto = vi.mocked(crypto);

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Set environment variable
    process.env.WALLET_MNEMONIC_ENCRYPTION_KEY = 'test-encryption-key';
    
    // Mock crypto functions
    const mockCipher = {
      update: vi.fn().mockReturnValue('encrypted'),
      final: vi.fn().mockReturnValue('data')
    };
    const mockDecipher = {
      update: vi.fn().mockReturnValue('decrypted'),
      final: vi.fn().mockReturnValue('mnemonic')
    };
    
    (mockCrypto.randomBytes as any).mockReturnValue(Buffer.from('1234567890123456'));
    mockCrypto.createCipher.mockReturnValue(mockCipher as any);
    mockCrypto.createDecipher.mockReturnValue(mockDecipher as any);
    
    // Mock algosdk functions
    const mockAccount = {
      addr: 'TESTADDRESS123' as any,
      sk: new Uint8Array([1, 2, 3])
    };
    mockGenerateAccount.mockReturnValue(mockAccount as any);
    mockSecretKeyToMnemonic.mockReturnValue('test mnemonic phrase');
    mockMnemonicToSecretKey.mockReturnValue(mockAccount as any);
    
    // Dynamic import to get fresh instance with env vars
    const module = await import('../services/walletService.js');
    WalletService = module.walletService.constructor;
    service = new WalletService();
  });

  afterEach(() => {
    delete process.env.WALLET_MNEMONIC_ENCRYPTION_KEY;
  });

  describe('constructor', () => {
    it('should throw error if encryption key is not provided', async () => {
      delete process.env.WALLET_MNEMONIC_ENCRYPTION_KEY;
      
      expect(() => new WalletService()).toThrow('WALLET_MNEMONIC_ENCRYPTION_KEY environment variable is required');
    });
  });

  describe('createEmbeddedWallet', () => {
    it('should return existing wallet if user already has one', async () => {
      const userId = 'test-user-id';
      const existingWallet = { id: 'wallet-123', address: 'EXISTING123' };
      
      mockSupabase.single.mockResolvedValueOnce({ data: existingWallet, error: null });
      
      const result = await service.createEmbeddedWallet(userId);
      
      expect(result).toEqual({
        address: 'EXISTING123',
        walletId: 'wallet-123'
      });
      expect(mockGenerateAccount).not.toHaveBeenCalled();
    });

    it('should create new wallet if user does not have one', async () => {
      const userId = 'test-user-id';
      const newWallet = { id: 'new-wallet-123', address: 'TESTADDRESS123' };
      
      // First call returns no existing wallet
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: newWallet, error: null });
      
      const result = await service.createEmbeddedWallet(userId);
      
      expect(mockGenerateAccount).toHaveBeenCalled();
      expect(mockSecretKeyToMnemonic).toHaveBeenCalled();
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        address: 'TESTADDRESS123',
        encrypted_mnemonic: '31323334353637383930313233343536:encrypteddata'
      });
      expect(result).toEqual({
        address: 'TESTADDRESS123',
        walletId: 'new-wallet-123'
      });
    });

    it('should throw error if database insert fails', async () => {
      const userId = 'test-user-id';
      
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: new Error('Database error') });
      
      await expect(service.createEmbeddedWallet(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getWalletByUserId', () => {
    it('should return wallet if found', async () => {
      const userId = 'test-user-id';
      const wallet = { id: 'wallet-123', address: 'TESTADDRESS123' };
      
      mockSupabase.single.mockResolvedValue({ data: wallet, error: null });
      
      const result = await service.getWalletByUserId(userId);
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toEqual(wallet);
    });

    it('should return null if wallet not found', async () => {
      const userId = 'test-user-id';
      
      mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      
      const result = await service.getWalletByUserId(userId);
      
      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const userId = 'test-user-id';
      
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Database error') });
      
      await expect(service.getWalletByUserId(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getWalletById', () => {
    it('should return wallet by ID', async () => {
      const walletId = 'wallet-123';
      const wallet = { id: walletId, address: 'TESTADDRESS123' };
      
      mockSupabase.single.mockResolvedValue({ data: wallet, error: null });
      
      const result = await service.getWalletById(walletId);
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', walletId);
      expect(result).toEqual(wallet);
    });

    it('should throw error if wallet not found', async () => {
      const walletId = 'wallet-123';
      
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });
      
      await expect(service.getWalletById(walletId)).rejects.toThrow('Not found');
    });
  });

  describe('getAccountFromWallet', () => {
    it('should return account from wallet', async () => {
      const walletId = 'wallet-123';
      const wallet = { 
        id: walletId, 
        address: 'TESTADDRESS123',
        encrypted_mnemonic: 'encrypted:mnemonic'
      };
      
      mockSupabase.single.mockResolvedValue({ data: wallet, error: null });
      
      const result = await service.getAccountFromWallet(walletId);
      
      expect(mockMnemonicToSecretKey).toHaveBeenCalledWith('decryptedmnemonic');
      expect(result).toEqual({
        addr: 'TESTADDRESS123',
        sk: new Uint8Array([1, 2, 3])
      });
    });
  });

  describe('getAccountFromUserId', () => {
    it('should return account from user ID', async () => {
      const userId = 'test-user-id';
      const wallet = { 
        id: 'wallet-123', 
        address: 'TESTADDRESS123',
        encrypted_mnemonic: 'encrypted:mnemonic'
      };
      
      mockSupabase.single.mockResolvedValue({ data: wallet, error: null });
      
      const result = await service.getAccountFromUserId(userId);
      
      expect(result).toEqual({
        addr: 'TESTADDRESS123',
        sk: new Uint8Array([1, 2, 3])
      });
    });

    it('should throw error if no wallet found', async () => {
      const userId = 'test-user-id';
      
      mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      
      await expect(service.getAccountFromUserId(userId)).rejects.toThrow('No wallet found for user');
    });
  });

  describe('deactivateWallet', () => {
    it('should deactivate wallet', async () => {
      const walletId = 'wallet-123';
      
      mockSupabase.eq.mockResolvedValue({ error: null });
      
      await service.deactivateWallet(walletId);
      
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', walletId);
    });

    it('should throw error if update fails', async () => {
      const walletId = 'wallet-123';
      
      mockSupabase.eq.mockResolvedValue({ error: new Error('Update failed') });
      
      await expect(service.deactivateWallet(walletId)).rejects.toThrow('Update failed');
    });
  });

  describe('encryptMnemonic and decryptMnemonic', () => {
    it('should encrypt and decrypt mnemonic correctly', () => {
      const testMnemonic = 'test mnemonic phrase';
      
      // Test encryption
      const encrypted = service.encryptMnemonic(testMnemonic);
      expect(encrypted).toBe('31323334353637383930313233343536:encrypteddata');
      
      // Test decryption
      const decrypted = service.decryptMnemonic('iv:encrypted');
      expect(decrypted).toBe('decryptedmnemonic');
    });

    it('should throw error for invalid encrypted mnemonic format', () => {
      expect(() => service.decryptMnemonic('invalid-format')).toThrow('Invalid encrypted mnemonic format');
    });
  });
});