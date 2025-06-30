-- Algorand integration tables
-- This migration adds support for Algorand wallets, NFTs, and transactions

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

-- RLS (Row Level Security) policies
ALTER TABLE public.algorand_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wallets
CREATE POLICY "Users can access their own algorand wallets" ON public.algorand_wallets
    FOR ALL USING (auth.uid() = user_id);

-- NFTs are publicly readable but only owners can modify
CREATE POLICY "NFTs are publicly readable" ON public.nfts
    FOR SELECT USING (true);

CREATE POLICY "NFT creators can insert" ON public.nfts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "NFT owners can update" ON public.nfts
    FOR UPDATE USING (
        current_owner_address IN (
            SELECT address FROM public.algorand_wallets WHERE user_id = auth.uid()
        )
    );

-- NFT transactions are publicly readable
CREATE POLICY "NFT transactions are publicly readable" ON public.nft_transactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert NFT transactions" ON public.nft_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');