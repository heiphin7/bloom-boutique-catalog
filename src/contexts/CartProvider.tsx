
import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getCurrentCart, addItemToCart, removeCartItem, updateCartItemQuantity, clearCart as clearCartService } from '@/services/cartService';
import { useAuth } from './AuthContext';
import { CartContext } from './CartContext';
import { CartItem } from '@/types/cart';

// Provider component
export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useAuth();

  // Fetch cart when auth state changes
  useEffect(() => {
    console.log('🔄 CartProvider auth state changed:', user ? `User ${user.id} logged in` : 'No user');
    
    if (user) {
      refreshCart();
    } else {
      console.log('🔄 No user, clearing cart state');
      setCartItems([]);
      setCartTotal(0);
      setLoading(false);
    }
  }, [user]);

  // Refresh cart from Supabase
  const refreshCart = async () => {
    console.log('🔄 Starting refreshCart function');
    
    if (!user) {
      console.log('⚠️ refreshCart called but no user is logged in');
      setCartItems([]);
      setCartTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching cart data for user:', user.id);
      const cart = await getCurrentCart();
      console.log('📦 Cart data received:', cart ? 'Success' : 'No cart returned');
      
      if (cart) {
        console.log('🛒 Cart items count:', cart.items ? cart.items.length : 0);
        
        // Transform cart items to match our CartItem type
        const items: CartItem[] = cart.items.map(item => {
          if (!item.product) {
            console.warn('⚠️ Cart item without product data:', item);
            return {
              id: item.id,
              product_id: item.product_id,
              name: 'Unknown Product',
              price: 0,
              image: null,
              quantity: item.quantity
            };
          }
          
          return {
            id: item.id,
            product_id: item.product_id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity
          };
        });
        
        console.log('✅ Transformed items:', items.length);
        setCartItems(items);
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('💰 Calculated cart total:', total);
        setCartTotal(total);
      } else {
        console.log('⚠️ No cart data returned, setting empty state');
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error) {
      console.error("❌ Error refreshing cart:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your cart",
        variant: "destructive"
      });
      
      // Reset state on error to prevent infinite loading
      setCartItems([]);
      setCartTotal(0);
    } finally {
      console.log('✅ Cart refresh complete, setting loading to false');
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (itemToAdd: Omit<CartItem, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await addItemToCart(itemToAdd.product_id, itemToAdd.quantity);
      
      if (success) {
        toast({
          title: "Added to cart",
          description: `${itemToAdd.quantity} x ${itemToAdd.name} added to your cart`,
        });
        
        // Refresh cart
        refreshCart();
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    if (!user) return;
    
    try {
      const itemToRemove = cartItems.find(item => item.id === id);
      
      if (itemToRemove) {
        const success = await removeCartItem(id);
        
        if (success) {
          toast({
            title: "Removed from cart",
            description: `${itemToRemove.name} removed from your cart`,
          });
          
          // Refresh cart
          refreshCart();
        } else {
          toast({
            title: "Error",
            description: "Failed to remove item from cart",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  // Update quantity of an item
  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) return;
    
    try {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      
      const success = await updateCartItemQuantity(id, quantity);
      
      if (success) {
        // Refresh cart
        refreshCart();
      } else {
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    if (!user) return;
    
    try {
      const success = await clearCartService();
      
      if (success) {
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart",
        });
        
        // Refresh cart
        refreshCart();
      } else {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };

  // Calculate total price of cart
  const getCartTotal = (): number => {
    return cartTotal;
  };

  // Get total number of items in cart
  const getItemCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Value to be provided to consumers
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    loading,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
