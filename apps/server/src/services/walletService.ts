import dotenv from 'dotenv';
// Load environment variables BEFORE any other imports
dotenv.config();

import { generateAccount, mnemonicToSecretKey, secretKeyToMnemonic } from 'algosdk';
import { supabase } from '@shared/supabase';
import crypto from 'crypto';

class WalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.WALLET_MNEMONIC_ENCRYPTION_KEY!;
    if (!this.encryptionKey) {
      throw new Error('WALLET_MNEMONIC_ENCRYPTION_KEY environment variable is required');
    }
  }

  async createEmbeddedWallet(userId: string) {
    // Check if user already has a wallet
    const existingWallet = await this.getWalletByUserId(userId);
    if (existingWallet) {
      return {
        address: existingWallet.address,
        walletId: existingWallet.id
      };
    }

    // Generate new Algorand account
    const account = generateAccount();
    
    // Get mnemonic from secret key
    const mnemonic = secretKeyToMnemonic(account.sk);
    
    // Encrypt mnemonic
    const encryptedMnemonic = this.encryptMnemonic(mnemonic);
    
    // Store in database
    const { data, error } = await supabase
      .from('algorand_wallets')
      .insert({
        user_id: userId,
        address: account.addr.toString(),
        encrypted_mnemonic: encryptedMnemonic
      })
      .select()
      .single();

    if (error) throw error;

    return {
      address: account.addr,
      walletId: data.id
    };
  }

  async getWalletByUserId(userId: string) {
    const { data, error } = await supabase
      .from('algorand_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  }

  async getWalletById(walletId: string) {
    const { data, error } = await supabase
      .from('algorand_wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (error) throw error;
    return data;
  }

  async getAccountFromWallet(walletId: string) {
    const wallet = await this.getWalletById(walletId);
    const mnemonic = this.decryptMnemonic(wallet.encrypted_mnemonic);
    return mnemonicToSecretKey(mnemonic);
  }

  async getAccountFromUserId(userId: string) {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error('No wallet found for user');
    }
    const mnemonic = this.decryptMnemonic(wallet.encrypted_mnemonic);
    return mnemonicToSecretKey(mnemonic);
  }

  async deactivateWallet(walletId: string) {
    const { error } = await supabase
      .from('algorand_wallets')
      .update({ is_active: false })
      .eq('id', walletId);

    if (error) throw error;
  }

  private encryptMnemonic(mnemonic: string): string {
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher('aes256', this.encryptionKey);
    let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptMnemonic(encryptedMnemonic: string): string {
    const parts = encryptedMnemonic.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted mnemonic format');
    }

    const [, encrypted] = parts;
    
    const decipher = crypto.createDecipher('aes256', this.encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export const walletService = new WalletService();