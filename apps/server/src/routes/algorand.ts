import { Router } from 'express';
import { walletService } from '../services/walletService.js';
import { nftService } from '../services/nftService.js';
import { algorandService } from '../services/algorandService.js';
import { supabase } from '@shared/supabase';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to get Supabase user from Authorization header (reused from spotify routes)
const getSupabaseUser = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
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
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    const accountInfo = await algorandService.getAccountInfo(wallet.address);
    
    res.json({
      address: wallet.address,
      balance: accountInfo.amount,
      assets: accountInfo.assets || []
    });
  } catch (error) {
    console.error('Failed to get wallet:', error);
    res.status(500).json({ error: 'Failed to get wallet' });
  }
});

router.get('/wallet/status', getSupabaseUser, async (req: any, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.id);
    res.json({
      hasWallet: !!wallet,
      address: wallet?.address
    });
  } catch (error) {
    console.error('Failed to get wallet status:', error);
    res.status(500).json({ error: 'Failed to get wallet status' });
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

    if (!name) {
      return res.status(400).json({ error: 'NFT name is required' });
    }

    const result = await nftService.mintNFT({
      userId: req.user.id,
      name,
      description: description || '',
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

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const result = await nftService.buyNFT({
      buyerUserId: req.user.id,
      nftId,
      priceInMicroAlgos: price
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to buy NFT:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to buy NFT' });
  }
});

router.post('/nft/:nftId/transfer', getSupabaseUser, async (req: any, res) => {
  try {
    const { nftId } = req.params;
    const { toAddress } = req.body;

    if (!toAddress) {
      return res.status(400).json({ error: 'Recipient address is required' });
    }

    // Get NFT to find asset ID
    const { data: nft, error: nftError } = await supabase
      .from('nfts')
      .select('asset_id')
      .eq('id', nftId)
      .single();

    if (nftError || !nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    const result = await nftService.transferNFT({
      fromUserId: req.user.id,
      toAddress,
      assetId: nft.asset_id
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to transfer NFT:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to transfer NFT' });
  }
});

router.post('/nft/:nftId/list', getSupabaseUser, async (req: any, res) => {
  try {
    const { nftId } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    await nftService.listNFTForSale({
      userId: req.user.id,
      nftId,
      priceInMicroAlgos: price
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to list NFT for sale:', error);
    res.status(500).json({ error: 'Failed to list NFT for sale' });
  }
});

router.delete('/nft/:nftId/list', getSupabaseUser, async (req: any, res) => {
  try {
    const { nftId } = req.params;

    await nftService.removeNFTFromSale({
      userId: req.user.id,
      nftId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove NFT from sale:', error);
    res.status(500).json({ error: 'Failed to remove NFT from sale' });
  }
});

router.get('/nfts', getSupabaseUser, async (req: any, res) => {
  try {
    const nfts = await nftService.getUserNFTs(req.user.id);
    res.json(nfts);
  } catch (error) {
    console.error('Failed to get user NFTs:', error);
    res.status(500).json({ error: 'Failed to get NFTs' });
  }
});

router.get('/nfts/marketplace', async (req: any, res) => {
  try {
    const nfts = await nftService.getNFTsForSale();
    res.json(nfts);
  } catch (error) {
    console.error('Failed to get marketplace NFTs:', error);
    res.status(500).json({ error: 'Failed to get marketplace NFTs' });
  }
});

router.get('/nft/:nftId', async (req: any, res) => {
  try {
    const { nftId } = req.params;

    const { data: nft, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('id', nftId)
      .single();

    if (error || !nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    res.json(nft);
  } catch (error) {
    console.error('Failed to get NFT:', error);
    res.status(500).json({ error: 'Failed to get NFT' });
  }
});

// Network status endpoint
router.get('/status', async (req: any, res) => {
  try {
    const status = await algorandService.getNodeStatus();
    res.json(status);
  } catch (error) {
    console.error('Failed to get network status:', error);
    res.status(500).json({ error: 'Failed to get network status' });
  }
});

export default router;