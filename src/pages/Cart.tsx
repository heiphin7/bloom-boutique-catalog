
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ChevronLeft, ShoppingCart } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatKztPrice } from "@/utils/currency";

const Cart = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, loading, refreshCart } = useCart();

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };

  // Refresh cart on page load
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Handle quantity change
  const handleQuantityChange = (id, currentQuantity, change) => {
    const newQuantity = Math.max(1, Math.min(10, currentQuantity + change));
    updateQuantity(id, newQuantity);
  };

  // Calculate subtotal, shipping and total
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal < 50 ? 10 : 0) : 0;
  const total = subtotal + shipping;

  // Handle checkout
  const handleCheckout = () => {
    navigate('/order-details');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} onSearchKeyDown={handleSearchKeyDown} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-floral-lavender"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} onSearchKeyDown={handleSearchKeyDown} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Shopping Cart</span>
        </nav>
        
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400">
              <ShoppingCart size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any flowers to your cart yet.</p>
            <Link to="/">
              <Button className="bg-floral-lavender hover:bg-floral-lavender/90">
                <ChevronLeft size={18} className="mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link to={`/product/${item.id}`}>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/product/${item.id}`} className="font-medium hover:text-floral-lavender transition-colors">
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{formatKztPrice(item.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= 10}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatKztPrice(item.price * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline"
                  className="border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10"
                  onClick={() => navigate('/')}
                >
                  <ChevronLeft size={18} className="mr-2" />
                  Continue Shopping
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-100"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
            
            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatKztPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? formatKztPrice(shipping) : 'Free'}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-gray-500">
                      Free shipping on orders over {formatKztPrice(22500)} {/* 50 USD * 450 */}
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-floral-peach">{formatKztPrice(total)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-floral-lavender hover:bg-floral-lavender/90" 
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
