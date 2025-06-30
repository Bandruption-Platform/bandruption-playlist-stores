## 🏗️ Architecture Overview

Your server will act as the unified API layer that:
- Interfaces with **Nodely APIs** for Algorand blockchain operations
- Integrates **AlgoKit Utils** for wallet management and transactions  
- Handles **NFT minting, buying, and transfers**
- Manages **embedded wallet creation and operations**

## 📋 Implementation Game Plan

### Phase 1: Foundation Setup

#### 1.1 Update Server Dependencies
```json:apps/server/package.json
{
  "dependencies": {
    "@algorandfoundation/algokit-utils": "^9.0.0",
    "algosdk": "^3.1.0",
    "axios": "^1.6.0",
    // ... existing dependencies
  }
}
```

#### 1.2 Environment Configuration
```bash:.env
# Algorand Network Configuration
ALGORAND_NETWORK=testnet # or mainnet
NODELY_API_URL=https://testnet-api.4160.nodely.dev
NODELY_INDEXER_URL=https://testnet-idx.4160.nodely.dev

# AlgoKit Configuration  
ALGOKIT_DISPENSER_AUTH_TOKEN=your_dispenser_token
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret

# Wallet Configuration
WALLET_MNEMONIC_ENCRYPTION_KEY=your_encryption_key
```

#### 1.3 Database Schema Extensions
```sql:packages/supabase/supabase/migrations/20250101000003_algorand_integration.sql
-- Algorand wallets table
CREATE TABLE public.algorand_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    encrypted_mnemonic TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- NFTs table
CREATE TABLE public.nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id BIGINT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    metadata_url TEXT,
    creator_address TEXT NOT NULL,
    current_owner_address TEXT,
    price BIGINT, -- in microAlgos
    for_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- NFT transactions table
CREATE TABLE public.nft_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'mint', 'buy', 'transfer'
    amount BIGINT, -- in microAlgos for purchases
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX idx_algorand_wallets_user_id ON public.algorand_wallets(user_id);
CREATE INDEX idx_algorand_wallets_address ON public.algorand_wallets(address);
CREATE INDEX idx_nfts_asset_id ON public.nfts(asset_id);
CREATE INDEX idx_nfts_owner ON public.nfts(current_owner_address);
CREATE INDEX idx_nft_transactions_nft_id ON public.nft_transactions(nft_id);
```

### Phase 2: Core Services Implementation

#### 2.1 Algorand Client Service
```typescript:apps/server/src/services/algorandService.ts
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';

class AlgorandService {
  private client: AlgorandClient;
  private algod: algosdk.Algodv2;
  private indexer: algosdk.Indexer;

  constructor() {
    this.algod = new algosdk.Algodv2(
      '', // No token needed for Nodely
      process.env.NODELY_API_URL!,
      ''
    );
    
    this.indexer = new algosdk.Indexer(
      '',
      process.env.NODELY_INDEXER_URL!,
      ''
    );

    this.client = new AlgorandClient({
      algod: this.algod,
      indexer: this.indexer,
      isLocalNet: false,
      isMainNet: process.env.ALGORAND_NETWORK === 'mainnet'
    });
  }

  async getNodeStatus() {
    return await this.algod.status().do();
  }

  async getAccountInfo(address: string) {
    return await this.algod.accountInformation(address).do();
  }

  async waitForConfirmation(txId: string) {
    return await this.client.algod.waitForConfirmation(txId).do();
  }
}

export const algorandService = new AlgorandService();
```

#### 2.2 Wallet Management Service
```typescript:apps/server/src/services/walletService.ts
import { generateAccount, mnemonicToSecretKey } from 'algosdk';
import { supabase } from '@shared/supabase';
import crypto from 'crypto';

class WalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.WALLET_MNEMONIC_ENCRYPTION_KEY!;
  }

  async createEmbeddedWallet(userId: string) {
    // Generate new Algorand account
    const account = generateAccount();
    
    // Encrypt mnemonic
    const encryptedMnemonic = this.encryptMnemonic(account.mnemonic);
    
    // Store in database
    const { data, error } = await supabase
      .from('algorand_wallets')
      .insert({
        user_id: userId,
        address: account.addr,
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

    if (error) throw error;
    return data;
  }

  async getAccountFromWallet(walletId: string) {
    const { data, error } = await supabase
      .from('algorand_wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (error) throw error;

    const mnemonic = this.decryptMnemonic(data.encrypted_mnemonic);
    return mnemonicToSecretKey(mnemonic);
  }

  private encryptMnemonic(mnemonic: string): string {
    const cipher = crypto.createCipher('aes256', this.encryptionKey);
    let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptMnemonic(encryptedMnemonic: string): string {
    const decipher = crypto.createDecipher('aes256', this.encryptionKey);
    let decrypted = decipher.update(encryptedMnemonic, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export const walletService = new WalletService();
```

#### 2.3 NFT Service
```typescript:apps/server/src/services/nftService.ts
import { algorandService } from './algorandService.js';
import { walletService } from './walletService.js';
import { supabase } from '@shared/supabase';
import { makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';
import axios from 'axios';

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
    const suggestedParams = await algorandService.algod.getTransactionParams().do();
    
    const assetCreateTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: account.addr,
      total: 1, // NFT - single unit
      decimals: 0,
      assetName: params.name,
      unitName: 'NFT',
      assetURL: metadataUrl,
      assetMetadataHash: undefined, // Optional: hash of metadata
      defaultFrozen: false,
      freeze: undefined,
      manager: account.addr,
      clawback: undefined,
      reserve: undefined,
      suggestedParams
    });

    // 5. Sign and send transaction
    const signedTxn = assetCreateTxn.signTxn(account.sk);
    const { txId } = await algorandService.algod.sendRawTransaction(signedTxn).do();

    // 6. Wait for confirmation
    const confirmation = await algorandService.waitForConfirmation(txId);
    const assetId = confirmation['asset-index'];

    // 7. Store NFT in database
    const { data, error } = await supabase
      .from('nfts')
      .insert({
        asset_id: assetId,
        name: params.name,
        description: params.description,
        image_url: imageUrl,
        metadata_url: metadataUrl,
        creator_address: account.addr,
        current_owner_address: account.addr
      })
      .select()
      .single();

    if (error) throw error;

    // 8. Record transaction
    await this.recordTransaction({
      nftId: data.id,
      transactionId: txId,
      toAddress: account.addr,
      transactionType: 'mint',
      blockNumber: confirmation['confirmed-round']
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
    // Implementation for buying NFTs
    // 1. Get buyer wallet
    // 2. Get NFT details
    // 3. Create payment + asset transfer atomic transaction
    // 4. Execute transaction
    // 5. Update ownership in database
  }

  async transferNFT(params: {
    fromUserId: string;
    toAddress: string;
    assetId: number;
  }) {
    // Implementation for transferring NFTs
    // 1. Get sender wallet
    // 2. Create asset transfer transaction
    // 3. Execute transaction
    // 4. Update ownership
  }

  private async uploadToIPFS(data: Buffer, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([data]), filename);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY!,
          'pinata_secret_api_key': process.env.PINATA_SECRET!,
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
      .insert(params);

    if (error) throw error;
  }
}

export const nftService = new NFTService();
```

### Phase 3: API Routes Implementation

#### 3.1 Algorand Routes
```typescript:apps/server/src/routes/algorand.ts
import { Router } from 'express';
import { walletService } from '../services/walletService.js';
import { nftService } from '../services/nftService.js';
import { algorandService } from '../services/algorandService.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware (reuse existing getSupabaseUser from spotify routes)
const getSupabaseUser = async (req: any, res: any, next: any) => {
  // ... copy from spotify routes
};

// Wallet endpoints
router.post('/wallet/create', getSupabaseUser, async (req: any, res) => {
  try {
    const wallet = await walletService.createEmbeddedWallet(req.user.id);
    res.json(wallet);
  } catch (error) {
    console.error('Failed to create wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

router.get('/wallet', getSupabaseUser, async (req: any, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    const accountInfo = await algorandService.getAccountInfo(wallet.address);
    
    res.json({
      address: wallet.address,
      balance: accountInfo.amount,
      assets: accountInfo.assets
    });
  } catch (error) {
    console.error('Failed to get wallet:', error);
    res.status(500).json({ error: 'Failed to get wallet' });
  }
});

// NFT endpoints
router.post('/nft/mint', getSupabaseUser, upload.single('image'), async (req: any, res) => {
  try {
    const { name, description, metadata } = req.body;
    const imageFile = req.file?.buffer;

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await nftService.mintNFT({
      userId: req.user.id,
      name,
      description,
      imageFile,
      metadata: metadata ? JSON.parse(metadata) : undefined
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

router.post('/nft/:nftId/buy', getSupabaseUser, async (req: any, res) => {
  try {
    const { nftId } = req.params;
    const { price } = req.body;

    const result = await nftService.buyNFT({
      buyerUserId: req.user.id,
      nftId,
      priceInMicroAlgos: price
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to buy NFT:', error);
    res.status(500).json({ error: 'Failed to buy NFT' });
  }
});

router.get('/nfts', getSupabaseUser, async (req: any, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('current_owner_address', wallet.address);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to get NFTs:', error);
    res.status(500).json({ error: 'Failed to get NFTs' });
  }
});

export default router;
```

#### 3.2 Update Main App
```typescript:apps/server/src/app.ts
import algorandRoutes from './routes/algorand.js';

// ... existing code ...

// Add Algorand routes
app.use('/api/algorand', algorandRoutes);

// ... existing code ...
```

### Phase 4: Type Definitions

#### 4.1 Update Shared Types
```typescript:packages/shared/src/types/index.ts
// Add to existing types

export interface AlgorandWallet {
  id: string;
  user_id: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  asset_id: number;
  name: string;
  description?: string;
  image_url: string;
  metadata_url: string;
  creator_address: string;
  current_owner_address?: string;
  price?: number;
  for_sale: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFTTransaction {
  id: string;
  nft_id: string;
  transaction_id: string;
  from_address?: string;
  to_address: string;
  transaction_type: 'mint' | 'buy' | 'transfer';
  amount?: number;
  block_number?: number;
  created_at: string;
}

export interface MintNFTRequest {
  name: string;
  description: string;
  metadata?: object;
}

export interface BuyNFTRequest {
  price: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  assets: any[];
}
```

## 🚀 Implementation Timeline

1. **Week 1**: Phase 1 - Foundation setup, dependencies, database schema
2. **Week 2**: Phase 2 - Core services (Algorand client, wallet management)  
3. **Week 3**: Phase 2 continued - NFT service implementation
4. **Week 4**: Phase 3 - API routes and integration
5. **Week 5**: Frontend integration for web and mobile apps
6. **Week 6**: Testing, optimization, and deployment

## 🔧 Development Tips

1. **Start with TestNet**: Use Algorand TestNet for development and testing
2. **Nodely Free Tier**: Start with the free tier (1000 req/s, 6MM req/month)
3. **Security**: Always encrypt wallet mnemonics, never expose private keys
4. **Error Handling**: Implement robust error handling for blockchain operations
5. **Rate Limiting**: Implement rate limiting to stay within API limits
6. **Monitoring**: Add logging and monitoring for transaction status

This architecture provides a scalable foundation for NFT functionality while maintaining your existing patterns and leveraging the robust Algorand ecosystem through Nodely's infrastructure and AlgoKit's developer tools.