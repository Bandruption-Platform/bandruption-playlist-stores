import dotenv from 'dotenv';
// Load environment variables BEFORE any other imports
dotenv.config();

import { algorandService } from './algorandService.js';
import { walletService } from './walletService.js';
import { supabase } from '@shared/supabase';
import algosdk from 'algosdk';
import axios from 'axios';
import FormData from 'form-data';

class NFTService {
  async mintNFT(params: {
    userId: string;
    name: string;
    description: string;
    imageFile: Buffer;
    metadata?: object;
  }) {
    // 1. Get user's wallet
    const wallet = await walletService.getWalletByUserId(params.userId);
    if (!wallet) {
      throw new Error('User does not have a wallet');
    }
    const account = await walletService.getAccountFromWallet(wallet.id);

    // 2. Upload image to IPFS via Pinata
    const imageUrl = await this.uploadToIPFS(params.imageFile, `${params.name}_image`);

    // 3. Create and upload metadata
    const metadata = {
      name: params.name,
      description: params.description,
      image: imageUrl,
      properties: {
        ...params.metadata
      }
    };
    
    const metadataUrl = await this.uploadToIPFS(
      Buffer.from(JSON.stringify(metadata)), 
      `${params.name}_metadata.json`
    );

    // 4. Create asset creation transaction
    const suggestedParams = await algorandService.getTransactionParams();
    
    const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      total: 1,
      decimals: 0,
      assetName: params.name,
      unitName: 'NFT',
      assetURL: metadataUrl,
      assetMetadataHash: undefined,
      defaultFrozen: false,
      freeze: account.addr,
      manager: account.addr,
      clawback: undefined,
      reserve: account.addr,
      suggestedParams
    });

    // 5. Sign and send transaction
    const signedTxn = assetCreateTxn.signTxn(account.sk);
    const response = await algorandService.sendRawTransaction(signedTxn);
    const txId = response.txid;

    // 6. Wait for confirmation
    const confirmation = await algorandService.waitForConfirmation(txId);
    const assetId = confirmation.assetIndex;

    // 7. Store NFT in database
    const { data, error } = await supabase
      .from('nfts')
      .insert({
        asset_id: Number(assetId),
        name: params.name,
        description: params.description,
        image_url: imageUrl,
        metadata_url: metadataUrl,
        creator_address: account.addr.toString(),
        current_owner_address: account.addr.toString()
      })
      .select()
      .single();

    if (error) throw error;

    // 8. Record transaction
    await this.recordTransaction({
      nftId: data.id,
      transactionId: txId,
      toAddress: account.addr.toString(),
      transactionType: 'mint',
      blockNumber: Number(confirmation.confirmedRound || 0)
    });

    return {
      assetId,
      txId,
      nft: data
    };
  }

  async buyNFT(params: {
    buyerUserId: string;
    nftId: string;
    priceInMicroAlgos: number;
  }) {
    // 1. Get buyer wallet
    const buyerWallet = await walletService.getWalletByUserId(params.buyerUserId);
    if (!buyerWallet) {
      throw new Error('Buyer does not have a wallet');
    }
    const buyerAccount = await walletService.getAccountFromWallet(buyerWallet.id);

    // 2. Get NFT details
    const { data: nft, error: nftError } = await supabase
      .from('nfts')
      .select('*')
      .eq('id', params.nftId)
      .single();

    if (nftError) throw nftError;

    if (!nft.for_sale) {
      throw new Error('NFT is not for sale');
    }

    if (nft.current_owner_address === buyerWallet.address) {
      throw new Error('Cannot buy your own NFT');
    }

    // 3. Create atomic transaction group (payment + asset transfer)
    const suggestedParams = await algorandService.getTransactionParams();

    // Payment transaction from buyer to seller
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: buyerAccount.addr,
      receiver: nft.current_owner_address!,
      amount: params.priceInMicroAlgos,
      suggestedParams
    });

    // Asset transfer from seller to buyer
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: nft.current_owner_address!,
      receiver: buyerAccount.addr,
      assetIndex: nft.asset_id,
      amount: 1,
      suggestedParams
    });

    // Group transactions
    const txns = [paymentTxn, assetTransferTxn];
    algosdk.assignGroupID(txns);

    // For now, we'll simulate that the seller also signs (in production this would be handled differently)
    // This is a limitation of the current implementation - in practice, you'd need a marketplace contract
    // or a multi-step process where the seller pre-approves the sale
    
    throw new Error('NFT buying requires seller signature - not implemented in this demo');
  }

  async transferNFT(params: {
    fromUserId: string;
    toAddress: string;
    assetId: number;
  }) {
    // 1. Get sender wallet
    const senderWallet = await walletService.getWalletByUserId(params.fromUserId);
    if (!senderWallet) {
      throw new Error('Sender does not have a wallet');
    }
    const senderAccount = await walletService.getAccountFromWallet(senderWallet.id);

    // 2. Verify sender owns the NFT
    const { data: nft, error: nftError } = await supabase
      .from('nfts')
      .select('*')
      .eq('asset_id', params.assetId)
      .eq('current_owner_address', senderWallet.address)
      .single();

    if (nftError) throw new Error('NFT not found or not owned by sender');

    // 3. Create asset transfer transaction
    const suggestedParams = await algorandService.getTransactionParams();
    
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: senderAccount.addr,
      receiver: params.toAddress,
      assetIndex: params.assetId,
      amount: 1,
      suggestedParams
    });

    // 4. Sign and send transaction
    const signedTxn = assetTransferTxn.signTxn(senderAccount.sk);
    const response = await algorandService.sendRawTransaction(signedTxn);
    const txId = response.txid;

    // 5. Wait for confirmation
    const confirmation = await algorandService.waitForConfirmation(txId);

    // 6. Update ownership in database
    const { error: updateError } = await supabase
      .from('nfts')
      .update({ 
        current_owner_address: params.toAddress,
        for_sale: false // Remove from sale when transferred
      })
      .eq('id', nft.id);

    if (updateError) throw updateError;

    // 7. Record transaction
    await this.recordTransaction({
      nftId: nft.id,
      transactionId: txId,
      fromAddress: senderWallet.address,
      toAddress: params.toAddress,
      transactionType: 'transfer',
      blockNumber: Number(confirmation.confirmedRound || 0)
    });

    return {
      txId,
      blockNumber: Number(confirmation.confirmedRound || 0)
    };
  }

  async listNFTForSale(params: {
    userId: string;
    nftId: string;
    priceInMicroAlgos: number;
  }) {
    const wallet = await walletService.getWalletByUserId(params.userId);
    if (!wallet) {
      throw new Error('User does not have a wallet');
    }

    const { error } = await supabase
      .from('nfts')
      .update({ 
        for_sale: true,
        price: params.priceInMicroAlgos
      })
      .eq('id', params.nftId)
      .eq('current_owner_address', wallet.address);

    if (error) throw error;
  }

  async removeNFTFromSale(params: {
    userId: string;
    nftId: string;
  }) {
    const wallet = await walletService.getWalletByUserId(params.userId);
    if (!wallet) {
      throw new Error('User does not have a wallet');
    }

    const { error } = await supabase
      .from('nfts')
      .update({ 
        for_sale: false,
        price: null
      })
      .eq('id', params.nftId)
      .eq('current_owner_address', wallet.address);

    if (error) throw error;
  }

  async getUserNFTs(userId: string) {
    const wallet = await walletService.getWalletByUserId(userId);
    if (!wallet) {
      return [];
    }

    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('current_owner_address', wallet.address);

    if (error) throw error;
    return data;
  }

  async getNFTsForSale() {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('for_sale', true);

    if (error) throw error;
    return data;
  }

  private async uploadToIPFS(data: Buffer, filename: string): Promise<string> {
    // Validate required environment variables
    const apiKey = process.env.PINATA_API_KEY;
    const secretKey = process.env.PINATA_SECRET;
    
    if (!apiKey || !secretKey) {
      throw new Error('PINATA_API_KEY and PINATA_SECRET environment variables are required');
    }

    // Use Node.js compatible FormData
    const formData = new FormData();
    formData.append('file', data, {
      filename,
      contentType: filename.endsWith('.json') ? 'application/json' : 'application/octet-stream'
    });

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
        }
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  }

  private async recordTransaction(params: {
    nftId: string;
    transactionId: string;
    fromAddress?: string;
    toAddress: string;
    transactionType: 'mint' | 'buy' | 'transfer';
    amount?: number;
    blockNumber: number;
  }) {
    const { error } = await supabase
      .from('nft_transactions')
      .insert({
        nft_id: params.nftId,
        transaction_id: params.transactionId,
        from_address: params.fromAddress,
        to_address: params.toAddress,
        transaction_type: params.transactionType,
        amount: params.amount,
        block_number: params.blockNumber,
      });

    if (error) throw error;
  }
}

export const nftService = new NFTService();