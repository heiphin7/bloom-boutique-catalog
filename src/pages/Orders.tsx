import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingBag, CreditCard, Filter, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOrders } from "../contexts/OrdersContext";
import { supabase } from "@/integrations/supabase/client";

const Orders = () => {
  const { orders, loading, refreshOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  // Check for success and session_id in URL params when component mounts
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    
    const verifyPayment = async () => {
      if (success === 'true' && sessionId) {
        setVerifyingPayment(true);
        try {
          // Call Stripe verification endpoint
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId }
          });
          
          if (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "We couldn't verify your payment status. Please contact support.",
              variant: "destructive"
            });
          } else if (data?.paid) {
            toast({
              title: "Payment Successful",
              description: "Your order has been confirmed and paid successfully!",
              variant: "default"
            });
            // Clean up URL
            navigate('/orders', { replace: true });
            // Refresh orders to show updated status
            refreshOrders();
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please contact support.",
            variant: "destructive"
          });
        } finally {
          setVerifyingPayment(false);
        }
      }
    };
    
    verifyPayment();
  }, [searchParams, navigate, refreshOrders]);
  
  // Update orders when component mounts
  useEffect(() => {
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };
  
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const productsMatch = order.products.some(product => 
        product.name.toLowerCase().includes(term)
      );
      return productsMatch || order.id.toLowerCase().includes(term) || 
             order.customer_name.toLowerCase().includes(term);
    }
    
    return true;
  });
  
  const handlePayment = async (orderId, stripeSessionId) => {
    try {
      if (stripeSessionId) {
        // If there's already a Stripe session, verify its status
        setVerifyingPayment(true);
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId: stripeSessionId }
        });
        
        if (error) {
          console.error("Payment verification error:", error);
          toast({
            title: "Error",
            description: "Failed to verify payment status.",
            variant: "destructive"
          });
          setVerifyingPayment(false);
          return;
        }
        
        if (data?.paid) {
          toast({
            title: "Order Paid",
            description: "This order has already been paid.",
          });
          refreshOrders();
          setVerifyingPayment(false);
          return;
        }
      }
      
      // Get order details
      const orderToProcess = orders.find(o => o.id === orderId);
      if (!orderToProcess) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive"
        });
        return;
      }
      
      // Create a new checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          cartItems: orderToProcess.products,
          customerInfo: { 
            name: orderToProcess.customer_name,
            email: orderToProcess.customer_email
          },
          orderId: orderId
        }
      });
      
      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Error",
          description: "Failed to create checkout session.",
          variant: "destructive"
        });
        return;
      }
      
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Invalid response from checkout service",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (loading || verifyingPayment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onSearchKeyDown={handleSearchKeyDown}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-floral-lavender mb-4"></div>
            {verifyingPayment && <p className="text-lg text-gray-600">Verifying payment status...</p>}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if we just returned from a successful Stripe payment
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  
  if (success === 'true' && sessionId) {
    // Show a temporary payment processing message while we verify
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onSearchKeyDown={handleSearchKeyDown}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
          <div className="flex flex-col justify-center items-center h-96">
            <AlertCircle className="h-16 w-16 text-floral-lavender mb-4" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600">We're confirming your payment with Stripe...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
        onSearchKeyDown={handleSearchKeyDown}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Orders</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Orders</h1>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setFilterStatus(filterStatus === "all" ? "paid" : filterStatus === "paid" ? "unpaid" : "all")}
              >
                <Filter className="h-4 w-4" />
                {filterStatus === "all" ? "All Orders" : filterStatus === "paid" ? "Paid Only" : "Unpaid Only"}
              </Button>
            </div>
            
            <Link to="/">
              <Button variant="outline" size="sm">Continue Shopping</Button>
            </Link>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400">
              <ShoppingBag size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">
              {searchTerm || filterStatus !== "all" 
                ? "Try changing your search or filter settings." 
                : "You haven't placed any orders yet."}
            </p>
            <Link to="/">
              <Button className="bg-floral-lavender hover:bg-floral-lavender/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>Placed on {new Date(order.date || order.created_at || "").toLocaleDateString()}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={order.status === "paid" ? "default" : "outline"}
                        className={order.status === "paid" 
                          ? "bg-floral-sage text-black border-floral-sage" 
                          : "border-floral-peach text-floral-peach"
                        }
                      >
                        {order.status === "paid" ? (
                          <><Check className="w-3 h-3 mr-1" /> Paid</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Unpaid</>
                        )}
                      </Badge>
                      <span className="font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.products.map((product) => (
                        <TableRow key={`${order.id}-${product.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-12 h-12 rounded-md object-cover" 
                              />
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                
                <CardFooter className="bg-gray-50 flex justify-between">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  
                  {order.status === "unpaid" && (
                    <Button 
                      onClick={() => handlePayment(order.id, order.stripeSessionId || "")}
                      className="bg-floral-lavender hover:bg-floral-lavender/90"
                      disabled={verifyingPayment}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {verifyingPayment ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                  
                  {order.status === "paid" && (
                    <Button variant="outline">View Details</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;
