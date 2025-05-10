
// Define types for cart items and context
export type CartItem = {
  id: string;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

export type CartContextType = {
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
