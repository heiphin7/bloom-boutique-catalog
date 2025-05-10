
// Import the Database type from the auto-generated types
import type { Database } from '@/integrations/supabase/types';

// Product type definition
export type Product = Database['public']['Tables']['products']['Row'];

// Session type definition
export type Session = Database['public']['Tables']['sessions']['Row'];

// Cart type definition
export type Cart = Database['public']['Tables']['carts']['Row'];

// CartItem type definition
export type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  product?: Product;
};

// Order type definition
export type Order = Database['public']['Tables']['orders']['Row'];

// OrderItem type definition
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

// Extended types with additional information
export type CartWithItems = Cart & {
  items: (CartItem & { product: Product })[];
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};
