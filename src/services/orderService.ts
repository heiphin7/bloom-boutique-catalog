
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSessionToken } from "./sessionService";
import { getCurrentCart, clearCart } from "./cartService";
import type { OrderWithItems } from "@/types/supabase";

// Create an order from cart
export const createOrder = async (
  customerInfo: { 
    name: string;
    email: string;
    shippingAddress: any;
  }
): Promise<string | null> => {
  try {
    const sessionToken = await getOrCreateSessionToken();
    const cart = await getCurrentCart();
    
    // If no cart or empty cart, return null
    if (!cart || !cart.items.length) {
      return null;
    }
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        session_token: sessionToken,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        shipping_address: customerInfo.shippingAddress,
        total,
        status: 'unpaid'
      })
      .select()
      .single();
    
    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return null;
    }
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
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
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
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
      items: orderItems
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

// Get all orders for current session
export const getSessionOrders = async (): Promise<OrderWithItems[]> => {
  try {
    const sessionToken = await getOrCreateSessionToken();
    
    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('session_token', sessionToken)
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
