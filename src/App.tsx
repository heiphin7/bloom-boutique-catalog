
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import OrderDetails from "./pages/OrderDetails";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <OrdersProvider>
                <WishlistProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
                    <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/order-details" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </WishlistProvider>
              </OrdersProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
