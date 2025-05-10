
import { supabase } from "@/integrations/supabase/client";
import type { CartWithItems, Product } from "@/types/supabase";

// Get or create cart
export const getOrCreateCart = async (): Promise<string> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to access cart');
  }
  
  // Check if the user already has a cart
  const { data: existingCart, error: fetchError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (fetchError) {
    console.error('Error fetching cart:', fetchError);
    throw new Error('Failed to fetch cart');
  }
  
  // If cart exists, return its ID
  if (existingCart?.id) {
    return existingCart.id;
  }
  
  // If no cart exists, create a new one
  const { data: newCart, error: insertError } = await supabase
    .from('carts')
    .insert({ user_id: user.id })
    .select('id')
    .single();
  
  if (insertError || !newCart) {
    console.error('Error creating cart:', insertError);
    throw new Error('Failed to create cart');
  }
  
  return newCart.id;
};

// Get current cart with items
export const getCurrentCart = async (): Promise<CartWithItems | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return null;
    }
    
    // If no cart exists, return null
    if (!cart) {
      return null;
    }
    
    // Get cart items with product details
    const { data: itemsWithProducts, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('cart_id', cart.id);
    
    if (itemsError) {
      console.error('Error fetching cart items:', itemsError);
      return null;
    }
    
    // Format the response
    return {
      ...cart,
      items: itemsWithProducts.map(item => ({
        ...item,
        product: item.product as Product,
      })),
    };
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return null;
  }
};

// Add item to cart
export const addItemToCart = async (productId: number, quantity: number): Promise<boolean> => {
  try {
    const cartId = await getOrCreateCart();
    
    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing cart item:', checkError);
      return false;
    }
    
    if (existingItem) {
      // Update quantity of existing item
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
      
      if (updateError) {
        console.error('Error updating cart item:', updateError);
        return false;
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });
      
      if (insertError) {
        console.error('Error adding item to cart:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
};

// Update item quantity
export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or less
      return removeCartItem(itemId);
    }
    
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
    
    if (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return false;
  }
};

// Remove item from cart
export const removeCartItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing cart item:', error);
    return false;
  }
};

// Clear cart
export const clearCart = async (): Promise<boolean> => {
  try {
    const cartId = await getOrCreateCart();
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
    
    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
};

// Calculate cart total
export const getCartTotal = async (): Promise<number> => {
  const cart = await getCurrentCart();
  
  if (!cart || !cart.items.length) {
    return 0;
  }
  
  return cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};
