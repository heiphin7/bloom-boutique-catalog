
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";

const Wishlist = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { wishlistItems, isLoading } = useWishlist();
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/catalog?search=${searchTerm.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">My Wishlist</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Items you've saved for later. Add them to your cart whenever you're ready.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
                <div className="mt-4 h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-2 h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {wishlistItems.map((item) => item.product && (
              <FlowerCard key={item.id} flower={item.product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <i className="fa-solid fa-heart-crack text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist and find them here later.</p>
            <Button
              onClick={() => navigate('/catalog')}
              className="bg-floral-lavender hover:bg-opacity-90 text-white transition-colors"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;
