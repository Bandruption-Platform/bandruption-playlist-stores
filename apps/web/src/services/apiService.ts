import { Album } from '../types';
import { mockAlbums } from '../data/mockData';

// Mock Spotify API Service
export const spotifyService = {
  search: async (query: string): Promise<Album[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple mock search filtering
    return mockAlbums.filter(album => 
      album.name.toLowerCase().includes(query.toLowerCase()) ||
      album.artist.toLowerCase().includes(query.toLowerCase()) ||
      album.genre.toLowerCase().includes(query.toLowerCase())
    );
  },

  getAlbumDetails: async (albumId: string): Promise<Album | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAlbums.find(album => album.id === albumId) || null;
  },

  getRecommendations: async (seedAlbums: string[]): Promise<Album[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Return random albums as recommendations
    const shuffled = [...mockAlbums].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
};

// Mock Algorand Blockchain Service
export const algorandService = {
  mintNFT: async (artworkData: {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      nftId: `nft-${Date.now()}`,
      transactionId: `txn-${Date.now()}`,
      algorandId: `algo-${Date.now()}`,
      success: true
    };
  },

  transferNFT: async (nftId: string, toAddress: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      transactionId: `transfer-${Date.now()}`,
      success: true
    };
  }
};

// Mock Printful API Service
export const printfulService = {
  createProduct: async (productData: {
    name: string;
    type: string;
    artworkUrl: string;
    price: number;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      productId: `product-${Date.now()}`,
      printfulId: `pf-${Date.now()}`,
      success: true
    };
  },

  getShippingRates: async (destination: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { method: 'Standard', price: 5.99, days: '5-7' },
      { method: 'Express', price: 12.99, days: '2-3' }
    ];
  }
};