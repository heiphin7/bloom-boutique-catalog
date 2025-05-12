
import React, { useState, useEffect } from 'react';
import { CartContext } from './CartContext';
import { CartItem } from '@/types/cart';
import { toast } from "@/components/ui/use-toast";
import { 
  addItemToCart as addToCartService, 
  getCurrentCart as getCart, 
  removeCartItem as removeFromCartService,
  updateCartItemQuantity,
  clearCart as clearCartService 
} from '@/services/cartService';
import { formatKztPrice } from '@/utils/currency';

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load cart from Supabase on mount
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const refreshCart = async () => {
    setLoading(true);
    try {
      const items = await getCart();
      setCartItems(items?.items?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      })) || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    try {
      // Check if the item is already in the cart
      const existingItem = cartItems.find(cartItem => 
        cartItem.product_id === item.product_id
      );
      
      if (existingItem) {
        // Update quantity if the item already exists
        const newQty = Math.min(10, existingItem.quantity + item.quantity);
        await updateQuantity(existingItem.id, newQty);
        toast({
          title: "Cart Updated",
          description: `Updated: ${item.name} (${newQty})`,
        });
      } else {
        // Add new item
        const success = await addToCartService(item.product_id, item.quantity);
        if (success) {
          await refreshCart();
          toast({
            title: "Added to Cart",
            description: `${item.name} - ${formatKztPrice(item.price)}`,
          });
        } else {
          throw new Error("Failed to add item to cart");
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (id: string) => {
    try {
      await removeFromCartService(id);
      await refreshCart(); // Refresh to get the updated cart
      toast({
        title: "Removed from Cart",
        description: "Item removed successfully"
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };
  
  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity < 1 || quantity > 10) {
        throw new Error("Quantity must be between 1 and 10");
      }
      
      await updateCartItemQuantity(id, quantity);
      await refreshCart(); // Refresh to get the updated cart
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };
  
  // Clear the cart
  const clearCart = async () => {
    try {
      await clearCartService();
      setCartItems([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed"
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };
  
  // Calculate the total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Count items in cart
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      loading,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
