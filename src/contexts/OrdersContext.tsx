
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getSessionOrders, updateOrderStatus as updateOrderStatusService, createOrder } from '@/services/orderService';
import type { CartItem } from './CartContext';

// Define order types
export type Order = {
  id: string;
  date: string;
  total: number;
  status: "paid" | "unpaid";
  products: CartItem[];
  stripeSessionId?: string;
  customer_name: string;
  customer_email: string;
  shipping_address: any;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'date'>) => Promise<string | null>;
  getOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: "paid" | "unpaid") => Promise<boolean>;
  loading: boolean;
  refreshOrders: () => Promise<void>;
};

// Create context with default values
const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: async () => null,
  getOrders: async () => [],
  updateOrderStatus: async () => false,
  loading: false,
  refreshOrders: async () => {},
});

// Custom hook to use the orders context
export const useOrders = () => useContext(OrdersContext);

// Provider component
export const OrdersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders on component mount
  useEffect(() => {
    refreshOrders();
  }, []);

  // Refresh orders from Supabase
  const refreshOrders = async () => {
    setLoading(true);
    try {
      const supabaseOrders = await getSessionOrders();
      
      if (supabaseOrders) {
        // Transform to match our Order type
        const transformedOrders: Order[] = supabaseOrders.map(order => ({
          id: order.id,
          date: order.created_at || new Date().toISOString(),
          total: order.total,
          status: order.status as "paid" | "unpaid",
          stripeSessionId: order.stripe_session_id || undefined,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          shipping_address: order.shipping_address,
          products: order.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            image: item.product_image || '',
            quantity: item.quantity
          }))
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new order
  const addOrder = async (orderData: Omit<Order, 'date'>): Promise<string | null> => {
    try {
      // Use createOrder service
      const orderId = await createOrder({
        id: orderData.id, // Now this is allowed in the type
        name: orderData.customer_name,
        email: orderData.customer_email,
        shippingAddress: orderData.shipping_address
      });
      
      if (orderId) {
        toast({
          title: "Order created",
          description: `Order #${orderId.slice(0, 8)} has been saved`,
        });
        
        // Refresh orders
        refreshOrders();
        
        return orderId;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
      return null;
    }
  };

  // Get all orders
  const getOrders = async (): Promise<Order[]> => {
    await refreshOrders();
    return orders;
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: "paid" | "unpaid"): Promise<boolean> => {
    try {
      const success = await updateOrderStatusService(orderId, status);
      
      if (success) {
        toast({
          title: "Order updated",
          description: `Order #${orderId.slice(0, 8)} status changed to ${status}`,
        });
        
        // Refresh orders
        refreshOrders();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
      return false;
    }
  };

  // Value to be provided to consumers
  const value = {
    orders,
    addOrder,
    getOrders,
    updateOrderStatus,
    loading,
    refreshOrders
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
