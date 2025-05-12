
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useOrders } from "../contexts/OrdersContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PaymentConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  
  const { refreshOrders } = useOrders();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{paid: boolean; orderId: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId || success !== 'true') {
        setError("Invalid payment information");
        setLoading(false);
        return;
      }
      
      try {
        // Call Stripe verification endpoint
        const { data, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });
        
        if (verifyError) {
          console.error("Payment verification error:", verifyError);
          setError("We couldn't verify your payment status. Please contact support.");
          setLoading(false);
          return;
        }
        
        setVerificationResult(data);
        
        if (data?.paid) {
          toast({
            title: "Payment Successful",
            description: "Your order has been confirmed and paid successfully!",
            variant: "default"
          });
          
          // Refresh orders to show updated status
          await refreshOrders();
        } else {
          setError("Payment verification failed. Please contact customer support.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("An unexpected error occurred. Please contact support.");
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [orderId, sessionId, success, refreshOrders]);

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
          <Link to="/orders" className="text-gray-500 hover:text-floral-lavender">Orders</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Payment Confirmation</span>
        </nav>

        {/* Payment verification status */}
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Payment Confirmation</CardTitle>
              <CardDescription>Order #{orderId?.slice(0, 8)}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center justify-center py-8">
              {loading ? (
                <>
                  <Loader2 className="h-16 w-16 text-floral-lavender animate-spin mb-4" />
                  <p className="text-lg">Verifying your payment...</p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Payment Verification Failed</h2>
                  <p className="text-gray-600 mb-4 text-center">{error}</p>
                </>
              ) : verificationResult?.paid ? (
                <>
                  <CheckCircle className="h-16 w-16 text-floral-sage mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-4 text-center">
                    Your order has been confirmed and paid successfully. A confirmation email will be sent shortly.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Payment Pending</h2>
                  <p className="text-gray-600 mb-4 text-center">
                    Your payment is being processed. We'll update your order status once confirmed.
                  </p>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/orders')} 
                className="bg-floral-lavender hover:bg-floral-lavender/90"
              >
                View Orders
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentConfirmation;
