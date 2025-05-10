
import React, { createContext } from 'react';
import { CartContextType } from '@/types/cart';
import { CartProvider } from './CartProvider';

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
export const useCart = () => React.useContext(CartContext);

// Export the context and provider
export { CartContext, CartProvider };
