
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWishlistItems, 
  toggleWishlistItem, 
  isInWishlist,
  WishlistItem
} from '@/services/wishlistService';
import type { Product } from '@/types/supabase';

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  toggleItem: (product: Product) => Promise<void>;
  checkIsInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: false,
  toggleItem: async () => {},
  checkIsInWishlist: () => false,
  refreshWishlist: async () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Load wishlist items when user changes
  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
      setIsLoading(false);
    }
  }, [user]);

  // Function to refresh wishlist data
  const refreshWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const items = await getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle item in wishlist
  const toggleItem = async (product: Product) => {
    await toggleWishlistItem(product);
    refreshWishlist();
  };

  // Check if product is in wishlist
  const checkIsInWishlist = (productId: number): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isLoading,
      toggleItem,
      checkIsInWishlist,
      refreshWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
