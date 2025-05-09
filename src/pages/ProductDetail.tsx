
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, StarHalf, StarOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { flowers } from "../data/flowers";
import { Button } from "@/components/ui/button";
import { useCart } from "../contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flower, setFlower] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedFlowers, setRelatedFlowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();
  
  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate('/?search=' + e.target.value.trim());
    }
  };
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const flowerData = flowers.find(f => f.id === Number(id));
      setFlower(flowerData);
      
      // Find related flowers (same type or occasion)
      if (flowerData) {
        const related = flowers
          .filter(f => 
            (f.id !== flowerData.id) && 
            (f.type === flowerData.type || 
             f.occasions.some(o => flowerData.occasions.includes(o)))
          )
          .slice(0, 3);
        setRelatedFlowers(related);
      }
      
      setIsLoading(false);
      
      // Scroll to top when product changes
      window.scrollTo(0, 0);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };
  
  const handleAddToCart = () => {
    if (flower) {
      addToCart({
        id: flower.id,
        name: flower.name,
        price: flower.price,
        image: flower.image,
        quantity: quantity
      });
    }
  };
  
  const handleAddToWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: `${flower?.name} added to your wishlist`,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!flower) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the flower you're looking for.</p>
          <Link to="/" className="bg-floral-lavender text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
            Return to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  const badgeClass = flower.isNew ? 'badge-new' : flower.onSale ? 'badge-sale' : flower.isBestseller ? 'badge-bestseller' : '';
  const badgeText = flower.isNew ? 'New' : flower.onSale ? 'Sale' : flower.isBestseller ? 'Bestseller' : '';
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="text-yellow-400 fill-yellow-400" size={16} />);
      } else {
        stars.push(<StarOff key={i} className="text-gray-300" size={16} />);
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="text-sm text-gray-500 ml-1">({flower.reviewCount} reviews)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Flowers</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{flower.name}</span>
        </nav>
        
        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product image */}
          <div className="relative rounded-lg overflow-hidden shadow-md">
            {badgeText && <span className={`ribbon ${badgeClass}`}>{badgeText}</span>}
            <img 
              src={flower.image} 
              alt={flower.name} 
              className="w-full h-full object-cover rounded-lg"
              style={{ maxHeight: '600px' }}
            />
          </div>
          
          {/* Product info */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{flower.name}</h1>
            
            <div className="flex items-center">
              {renderStars(flower.rating)}
            </div>
            
            <div className="flex items-center space-x-4">
              {flower.onSale ? (
                <>
                  <span className="text-gray-400 line-through text-xl">${flower.originalPrice.toFixed(2)}</span>
                  <span className="text-floral-peach font-bold text-2xl">${flower.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="font-bold text-2xl">${flower.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-medium">Colors:</span>
              <div className="flex items-center">
                {flower.colors.map((color, index) => (
                  <span 
                    key={index} 
                    className="w-5 h-5 rounded-full mr-1 border border-gray-200 cursor-pointer hover:scale-110 transition-transform" 
                    style={{ backgroundColor: color }}
                    title={color}
                  ></span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Description</h3>
              <p className="text-gray-600">{flower.description}</p>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-1 mb-6">
                <h3 className="text-gray-700 font-medium mr-3">Quantity:</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-floral-lavender hover:bg-floral-lavender/90 text-white flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2" size={18} />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  className="border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="mr-2" size={18} />
                  Add to Wishlist
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-700 font-medium mb-2">Details</h3>
              <ul className="space-y-2">
                <li className="flex">
                  <span className="text-gray-600 w-24">Type:</span>
                  <span className="text-gray-800">{flower.type}</span>
                </li>
                <li className="flex flex-wrap">
                  <span className="text-gray-600 w-24">Occasions:</span>
                  <div className="flex flex-wrap">
                    {flower.occasions.map((occasion, index) => (
                      <span key={occasion} className="text-gray-800">
                        {occasion}{index < flower.occasions.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </li>
                <li className="flex">
                  <span className="text-gray-600 w-24">Date Added:</span>
                  <span className="text-gray-800">{new Date(flower.dateAdded).toLocaleDateString()}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {relatedFlowers.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedFlowers.map((relatedFlower) => (
                <Link to={`/product/${relatedFlower.id}`} key={relatedFlower.id} className="block">
                  <div className="catalog-card group">
                    <div className="relative overflow-hidden h-64">
                      <img 
                        src={relatedFlower.image} 
                        alt={relatedFlower.name} 
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-1">{relatedFlower.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {relatedFlower.onSale ? (
                            <>
                              <span className="text-gray-400 line-through mr-2">${relatedFlower.originalPrice.toFixed(2)}</span>
                              <span className="text-floral-peach font-semibold">${relatedFlower.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-semibold">${relatedFlower.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
