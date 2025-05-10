
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getCurrentCart, addItemToCart, removeCartItem, updateCartItemQuantity, clearCart as clearCartService, getCartTotal as getCartTotalService } from '@/services/cartService';

// Define types
export type CartItem = {
  id: string;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  loading: boolean;
  refreshCart: () => Promise<void>;
};

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getItemCount: () => 0,
  loading: false,
  refreshCart: async () => {}
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  // Fetch cart on component mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Refresh cart from Supabase
  const refreshCart = async () => {
    setLoading(true);
    try {
      const cart = await getCurrentCart();
      
      if (cart) {
        // Transform cart items to match our CartItem type
        const items: CartItem[] = cart.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity
        }));
        
        setCartItems(items);
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (itemToAdd: Omit<CartItem, 'id'>) => {
    try {
      const success = await addItemToCart(itemToAdd.product_id, itemToAdd.quantity);
      
      if (success) {
        toast({
          title: "Added to cart",
          description: `${itemToAdd.quantity} x ${itemToAdd.name} added to your cart`,
        });
        
        // Refresh cart
        refreshCart();
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
    try {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      
      const success = await updateCartItemQuantity(id, quantity);
      
      if (success) {
        // Refresh cart
        refreshCart();
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
    try {
      const success = await clearCartService();
      
      if (success) {
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart",
        });
        
        // Refresh cart
        refreshCart();
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
