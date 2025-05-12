
// Import the Database type from the auto-generated types
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

// Product type definition
export type Product = Database['public']['Tables']['products']['Row'];

// Session type definition
export type Session = Database['public']['Tables']['sessions']['Row'];

// Profile type definition
export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
};

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

// Wishlist type definition
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];

// WishlistItem type definition
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'] & {
  product?: Product;
};

// Extended types with additional information
export type CartWithItems = Cart & {
  items: (CartItem & { product: Product })[];
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

export type WishlistWithItems = Wishlist & {
  items: (WishlistItem & { product: Product })[];
};

// Auth related types
export type AuthUser = User;

export type UserWithProfile = AuthUser & {
  profile: Profile;
};
