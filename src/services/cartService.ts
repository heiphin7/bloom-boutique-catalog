
import { supabase } from "@/integrations/supabase/client";
import type { CartWithItems, Product } from "@/types/supabase";

// Get or create cart
export const getOrCreateCart = async (): Promise<string> => {
  try {
    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult?.user?.id) {
      console.error("❌ Ошибка получения пользователя или пользователь не авторизован:", userError);
      throw new Error("User must be authenticated to access or create cart.");
    }

    const userId = userResult.user.id;
    console.log("👤 Текущий user_id:", userId);

    // Проверяем наличие уже существующей корзины
    const { data: existingCart, error: fetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Ошибка при получении корзины:", fetchError);
      throw new Error("Failed to fetch cart.");
    }

    if (existingCart?.id) {
      console.log("✅ Найдена существующая корзина:", existingCart.id);
      return existingCart.id;
    }

    // Вставляем новую корзину
    const insertPayload = { user_id: userId };
    console.log("🛒 Создание новой корзины с payload:", JSON.stringify(insertPayload, null, 2));

    const { data: newCart, error: insertError, status } = await supabase
      .from("carts")
      .insert(insertPayload)
      .select("id")
      .single();
    
    console.log("🛒 Статус создания корзины:", status);

    if (insertError) {
      console.error("❌ Ошибка при создании корзины:", insertError);
      console.error("❌ Отправленные данные:", insertPayload);
      throw new Error("Failed to insert new cart.");
    }

    if (!newCart?.id) {
      console.error("❌ Корзина создана, но ID не вернулся.");
      throw new Error("Cart created but no ID returned.");
    }

    console.log("✅ Корзина успешно создана:", newCart.id);
    return newCart.id;

  } catch (error) {
    console.error("❌ Ошибка в getOrCreateCart:", error);
    throw error;
  }
};

// Get current cart with items
export const getCurrentCart = async (): Promise<CartWithItems | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }
    
    console.log('Getting cart for user ID:', user.id);
    
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
    
    // If no cart exists, create one
    if (!cart) {
      try {
        console.log('No cart found, creating one for user:', user.id);
        const cartId = await getOrCreateCart();
        
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .select('*')
          .eq('id', cartId)
          .single();
          
        if (newCartError || !newCart) {
          console.error('Error fetching newly created cart:', newCartError);
          return null;
        }
        
        console.log('Successfully created and fetched new cart:', newCart);
        return {
          ...newCart,
          items: []
        };
      } catch (error) {
        console.error('Error creating cart:', error);
        return null;
      }
    }
    
    console.log('Found existing cart:', cart.id);
    
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
    console.log('Adding to cart:', { productId, quantity });
    
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userResult?.user?.id) {
      console.error('Error getting user or user not authenticated:', userError);
      return false;
    }
    
    console.log('Current user ID:', userResult.user.id);
    
    // Get or create cart
    const cartId = await getOrCreateCart();
    console.log('Resolved cart ID:', cartId);
    
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
      console.log('Updating existing item:', existingItem.id);
      const newQuantity = existingItem.quantity + quantity;
      
      const updatePayload = { quantity: newQuantity };
      console.log('Cart item update payload:', JSON.stringify(updatePayload, null, 2));
      
      const { data: updatedItem, error: updateError, status } = await supabase
        .from('cart_items')
        .update(updatePayload)
        .eq('id', existingItem.id)
        .select();
      
      console.log('Update status:', status);
      
      if (updateError) {
        console.error('Error updating cart item:', updateError);
        console.error('Update payload:', updatePayload);
        return false;
      }
      
      console.log('Successfully updated item quantity to', newQuantity, 'Response:', updatedItem);
    } else {
      // Add new item
      console.log('Adding new item to cart');
      const insertPayload = {
        cart_id: cartId,
        product_id: productId,
        quantity,
        added_at: new Date().toISOString()
      };
      console.log('Cart item insert payload:', JSON.stringify(insertPayload, null, 2));
      
      const { data, error: insertError, status } = await supabase
        .from('cart_items')
        .insert(insertPayload)
        .select();
      
      console.log('Insert status:', status);
      
      if (insertError) {
        console.error('Error adding item to cart:', insertError);
        console.error('Insert payload:', insertPayload);
        return false;
      }
      
      console.log('Successfully added new item to cart', data);
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
    
    console.log('Updating cart item quantity:', { itemId, quantity });
    
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select();
    
    if (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }
    
    console.log('Successfully updated cart item quantity:', data);
    return true;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return false;
  }
};

// Remove item from cart
export const removeCartItem = async (itemId: string): Promise<boolean> => {
  try {
    console.log('Removing cart item:', itemId);
    
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .select();
    
    if (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
    
    console.log('Successfully removed cart item:', data);
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
    console.log('Clearing cart:', cartId);
    
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .select();
    
    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
    
    console.log('Successfully cleared cart:', data);
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
