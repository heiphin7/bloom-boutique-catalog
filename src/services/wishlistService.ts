
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/supabase";

export type WishlistItem = {
  id: string;
  product_id: number;
  added_at: string;
  product?: Product;
};

// Get the user's wishlist ID or create one if it doesn't exist
export const getOrCreateWishlist = async (): Promise<string | null> => {
  try {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Try to find existing wishlist
    let { data: wishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    // If no wishlist exists, create one
    if (!wishlist) {
      const { data: newWishlist, error } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id }])
        .select('id')
        .single();
      
      if (error) throw error;
      wishlist = newWishlist;
    }
    
    return wishlist?.id || null;
  } catch (error) {
    console.error("Error fetching/creating wishlist:", error);
    return null;
  }
};

// Get all items in the user's wishlist with product details
export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  try {
    const wishlistId = await getOrCreateWishlist();
    if (!wishlistId) return [];
    
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        added_at,
        product:products(*)
      `)
      .eq('wishlist_id', wishlistId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return [];
  }
};

// Check if a product is in the wishlist
export const isInWishlist = async (productId: number): Promise<boolean> => {
  try {
    const wishlistId = await getOrCreateWishlist();
    if (!wishlistId) return false;
    
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

// Add a product to the wishlist
export const addToWishlist = async (productId: number, productName: string): Promise<boolean> => {
  try {
    const wishlistId = await getOrCreateWishlist();
    if (!wishlistId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('wishlist_items')
      .insert([{ 
        wishlist_id: wishlistId,
        product_id: productId
      }])
      .single();
    
    if (error) {
      // If duplicate, it's already in the wishlist
      if (error.code === '23505') {
        toast({
          title: "Already in wishlist",
          description: `${productName} is already in your wishlist`,
        });
        return true;
      }
      throw error;
    }
    
    toast({
      title: "Added to wishlist",
      description: `${productName} has been added to your wishlist`,
    });
    
    return true;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    toast({
      title: "Failed to add item",
      description: "There was an error adding the item to your wishlist",
      variant: "destructive",
    });
    return false;
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (productId: number, productName: string): Promise<boolean> => {
  try {
    const wishlistId = await getOrCreateWishlist();
    if (!wishlistId) return false;
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('product_id', productId);
    
    if (error) throw error;
    
    toast({
      title: "Removed from wishlist",
      description: `${productName} has been removed from your wishlist`,
    });
    
    return true;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    toast({
      title: "Failed to remove item",
      description: "There was an error removing the item from your wishlist",
      variant: "destructive",
    });
    return false;
  }
};

// Toggle a product in the wishlist
export const toggleWishlistItem = async (product: Product): Promise<boolean> => {
  const isProductInWishlist = await isInWishlist(product.id);
  
  if (isProductInWishlist) {
    return await removeFromWishlist(product.id, product.name);
  } else {
    return await addToWishlist(product.id, product.name);
  }
};
