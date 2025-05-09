
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, CreditCard, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "../contexts/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Load Stripe outside of component render
const stripePromise = loadStripe("pk_test_51QH16MGg3EsGOCa6DOaYICHrsdQJr6VjqjNjocnCeQPgP1psHxsNI8w4p5uX9pybw6CNhxFK453IMfDSiFYHckXQ00Iznw9kcz");

// Styling for Stripe Card Element
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: 'Poppins, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Payment Form Component
const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate total amount
  const amount = getCartTotal();
  const formattedAmount = (amount).toFixed(2);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }

    setLoading(true);
    setError(null);

    // Validate form
    if (!email || !name) {
      setError("Please fill out all fields");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card information is required");
      setLoading(false);
      return;
    }

    try {
      // Simulate payment processing
      // In a real implementation, you would create a payment intent on your server
      // and confirm it with the Stripe API
      
      // Get token from Stripe (to test card validation)
      const { error: stripeError } = await stripe.createToken(cardElement);

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      // Simulate payment processing delay
      setTimeout(() => {
        // Payment successful
        setSuccess(true);
        clearCart(); // Clear the cart after successful payment
        
        toast({
          title: "Payment successful!",
          description: `Thank you for your purchase of $${formattedAmount}`,
        });
        
        // After 2 seconds, redirect to home
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
        setLoading(false);
      }, 1500);
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-floral-sage rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
        <p className="text-gray-600">Redirecting you to the homepage...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="Jane Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="jane@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="card">Card Details</Label>
          <div className="border rounded-md p-3 bg-white">
            <CardElement id="card" options={cardElementOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Test card: 4242 4242 4242 4242 • Exp: Any future date • CVC: Any 3 digits
          </p>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-floral-lavender hover:bg-floral-lavender/90" 
        disabled={!stripe || loading}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          <>Pay ${formattedAmount}</>
        )}
      </Button>
    </form>
  );
};

// Main Payment Page Component
const Payment = () => {
  const { getCartTotal, cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal < 50 ? 10 : 0) : 0;
  const total = subtotal + shipping;

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
          <span className="text-gray-800">Payment</span>
        </nav>
        
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400">
              <ShoppingCart size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before proceeding to checkout.</p>
            <Link to="/">
              <Button className="bg-floral-lavender hover:bg-floral-lavender/90">
                Shop Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order summary */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your order before payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md mr-2" />
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
                    </div>
                    {shipping > 0 && (
                      <div className="text-xs text-gray-500">
                        Free shipping on orders over $50
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-base pt-2 border-t">
                      <span>Total</span>
                      <span className="text-floral-peach">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/cart" className="w-full">
                    <Button variant="outline" className="w-full border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10">
                      Edit Cart
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Payment form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>
                    Enter your payment information securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise}>
                    <PaymentForm />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;
