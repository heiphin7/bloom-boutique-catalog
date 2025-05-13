
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Check, ChevronLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FlowerCard from "../components/FlowerCard";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "@/components/ui/use-toast";
import { getProductById, getRelatedProducts } from "@/services/productService";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatKztPrice } from "@/utils/currency";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { checkIsInWishlist, toggleItem } = useWishlist();
  const [flower, setFlower] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Load product and related products data
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        // Parse ID to number
        const productId = parseInt(id || '0');
        if (!productId) {
          navigate('/404');
          return;
        }
        
        const product = await getProductById(productId);
        
        if (!product) {
          navigate('/404');
          return;
        }
        
        setFlower(product);
        setIsInWishlist(checkIsInWishlist(productId));
        
        // Load related products
        const related = await getRelatedProducts(productId, product.type);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error loading product:", error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, navigate, checkIsInWishlist]);
  
  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setQuantity(value);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (flower) {
      addToCart({
        product_id: flower.id,
        name: flower.name,
        price: flower.price,
        image: flower.image,
        quantity
      });
    }
  };
  
  // Handle toggle wishlist
  const handleToggleWishlist = async () => {
    if (flower) {
      await toggleItem(flower);
      setIsInWishlist(checkIsInWishlist(flower.id));
    }
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
  
  if (!flower) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} onSearchKeyDown={handleSearchKeyDown} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Главная</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/shop" className="text-gray-500 hover:text-floral-lavender">Каталог</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{flower.name}</span>
        </nav>
        
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image with AspectRatio */}
          <div className="rounded-lg shadow-md overflow-hidden">
            <AspectRatio ratio={4/3} className="bg-gray-100">
              <img 
                src={flower.image} 
                alt={flower.name} 
                className="w-full h-full object-cover" 
              />
            </AspectRatio>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-semibold mb-4">{flower.name}</h1>
            <p className="text-gray-600 mb-6">{flower.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-floral-peach">{formatKztPrice(flower.price)}</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    className="w-16 text-center focus-visible:outline-none focus-visible:ring-0 shadow-none border-none"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max="10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mb-6">
              <Button 
                className="bg-floral-lavender hover:bg-floral-lavender/90 flex-grow"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} className="mr-2" />
                Добавить в корзину
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "border-floral-lavender hover:bg-floral-lavender/10",
                  isInWishlist ? "text-red-500 border-red-500 hover:bg-red-50" : "text-floral-lavender"
                )}
                onClick={handleToggleWishlist}
              >
                {isInWishlist ? (
                  <>
                    <Heart size={18} className="mr-2 fill-current" />
                    В избранном
                  </>
                ) : (
                  <>
                    <Heart size={18} className="mr-2" />
                    В избранное
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Категория: <Link to={`/?category=${flower.type}`} className="text-floral-lavender hover:underline">{flower.type}</Link>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <FlowerCard key={product.id} flower={product} />
              ))}
            </div>
          </div>
        )}
        
        {/* Back to Shop Link */}
        <div className="mt-8">
          <Button 
            variant="outline"
            className="border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10"
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={18} className="mr-2" />
            Вернуться в каталог
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
