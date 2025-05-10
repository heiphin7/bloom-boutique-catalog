
import { supabase } from "@/integrations/supabase/client";
import type { OrderWithItems } from "@/types/supabase";

// Create an order from cart
export const createOrder = async (
  customerInfo: { 
    id?: string;
    name: string;
    email: string;
    shippingAddress: any;
  }
): Promise<string | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User must be authenticated to create an order');
      return null;
    }
    
    // Get cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!cart) {
      console.error('No cart found for user');
      return null;
    }
    
    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('cart_id', cart.id);
    
    // If no cart or empty cart, return null
    if (!cartItems || !cartItems.length) {
      return null;
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    // Generate a UUID for session_token to satisfy the type requirements
    const sessionToken = crypto.randomUUID();
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        shipping_address: customerInfo.shippingAddress,
        total,
        status: 'unpaid',
        ...(customerInfo.id ? { id: customerInfo.id } : {})
      })
      .select()
      .single();
    
    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return null;
    }
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      product_price: item.product.price,
      product_image: item.product.image,
      quantity: item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return null;
    }
    
    // Clear the cart after successful order creation
    await clearCart();
    
    return order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<OrderWithItems | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return null;
    }
    
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('order_id', order.id);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return null;
    }
    
    // Return order with items
    return {
      ...order,
      items: orderItems || []
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

// Get all orders for current user
export const getSessionOrders = async (): Promise<OrderWithItems[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (ordersError || !orders) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }
    
    // Get items for each order
    const ordersWithItems: OrderWithItems[] = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return { ...order, items: [] };
        }
        
        return { ...order, items: items || [] };
      })
    );
    
    return ordersWithItems;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: 'paid' | 'unpaid', 
  stripeSessionId?: string
): Promise<boolean> => {
  try {
    const updateData: any = { status };
    
    if (stripeSessionId) {
      updateData.stripe_session_id = stripeSessionId;
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
};

// Helper function to clear cart
const clearCart = async (): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Get cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!cart) {
      return true; // No cart to clear
    }
    
    // Delete cart items
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);
    
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

// Re-export the clearCart function for public use
export { clearCart };
