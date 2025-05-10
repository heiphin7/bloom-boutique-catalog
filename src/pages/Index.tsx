
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Gift, Heart, ShieldCheck, Truck } from "lucide-react";
import { flowers } from "../data/flowers";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        window.location.href = `/catalog?search=${searchTerm.trim()}`;
      }
    }
  };
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Featured products for the landing page
  const featuredFlowers = flowers
    .filter(flower => flower.featured)
    .sort((a, b) => b.featured - a.featured)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
      />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-floral-cream to-floral-mint overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                  Exquisite Flowers for Every <span className="text-floral-lavender">Occasion</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-md">
                  Discover our handpicked selection of premium flowers, delivered fresh to your doorstep for moments that matter.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-floral-lavender hover:bg-floral-lavender/90 text-white"
                    asChild
                  >
                    <Link to="/catalog">
                      Browse Collection <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10"
                    asChild
                  >
                    <Link to="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-floral-pink rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-floral-sage rounded-full opacity-20 blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1513378782605-4000af6a22a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="Colorful flower bouquet" 
                  className="relative z-10 rounded-lg shadow-xl animate-slide-up object-cover h-[450px] w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose Our Flowers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We pride ourselves on quality, sustainability, and exceptional service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Handpicked flowers sourced from the finest gardens around the world.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Same-day delivery available for orders placed before 2PM local time.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Freshness Guarantee</h3>
                <p className="text-gray-600">Our flowers stay fresh for at least 7 days or your money back.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Made With Love</h3>
                <p className="text-gray-600">Each arrangement is carefully crafted by our expert florists.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gradient-to-b from-white to-floral-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Arrangements</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Popular choices loved by our customers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredFlowers.map((flower) => (
                <FlowerCard key={flower.id} flower={flower} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="bg-floral-lavender hover:bg-floral-lavender/90 text-white"
                asChild
              >
                <Link to="/catalog">
                  View All Collections <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-floral-lavender">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center mb-4 bg-floral-cream px-3 py-1 rounded-full">
                    <Gift className="h-4 w-4 text-floral-lavender mr-2" />
                    <span className="text-sm font-medium text-floral-lavender">Special Offer</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">15% Off Your First Order</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Join our floral family today and receive a special discount on your first purchase. The perfect way to brighten someone's day.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      size="lg" 
                      className="bg-floral-lavender hover:bg-floral-lavender/90 text-white"
                      asChild
                    >
                      <Link to="/catalog">
                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img 
                    src="https://images.unsplash.com/photo-1593546109964-ef22572ad1a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                    alt="Flower gift box" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
