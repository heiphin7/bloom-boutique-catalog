
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { CartItem } from './CartContext';

// Define order types
export type Order = {
  id: string;
  date: string;
  total: number;
  status: "paid" | "unpaid";
  products: CartItem[];
  stripeSessionId?: string;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrders: () => Order[];
  updateOrderStatus: (orderId: string, status: "paid" | "unpaid") => void;
};

// Create context with default values
const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  getOrders: () => [],
  updateOrderStatus: () => {},
});

// Custom hook to use the orders context
export const useOrders = () => useContext(OrdersContext);

// Provider component
export const OrdersProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Initialize orders from localStorage if available
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('flowerOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flowerOrders', JSON.stringify(orders));
  }, [orders]);

  // Add a new order
  const addOrder = (orderToAdd: Order) => {
    setOrders(prevOrders => {
      // Check if order already exists
      const existingOrderIndex = prevOrders.findIndex(order => order.id === orderToAdd.id);
      
      if (existingOrderIndex >= 0) {
        // Update existing order
        const updatedOrders = [...prevOrders];
        updatedOrders[existingOrderIndex] = orderToAdd;
        return updatedOrders;
      } else {
        // Add new order
        return [...prevOrders, orderToAdd];
      }
    });

    toast({
      title: "Order created",
      description: `Order #${orderToAdd.id} has been ${orderToAdd.status === "paid" ? "paid and " : ""}saved`,
    });
  };

  // Get all orders
  const getOrders = () => {
    return orders;
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: "paid" | "unpaid") => {
    setOrders(prevOrders => {
      return prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status } 
          : order
      );
    });
    
    toast({
      title: "Order updated",
      description: `Order #${orderId} status changed to ${status}`,
    });
  };

  // Value to be provided to consumers
  const value = {
    orders,
    addOrder,
    getOrders,
    updateOrderStatus
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
