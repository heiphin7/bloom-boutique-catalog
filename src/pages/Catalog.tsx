
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import Sidebar from "../components/Sidebar";
import { searchProducts } from "@/services/productService";
import { Button } from "@/components/ui/button";

const Catalog = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    colors: [],
    occasions: [],
    types: [],
    priceRange: [0, 200] as [number, number], // Explicitly type as tuple
  });
  const [sortOption, setSortOption] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse query params on page load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search');
    const category = queryParams.get('category');
    
    if (search) {
      setSearchTerm(search);
    }
    
    if (category) {
      setActiveFilters(prev => ({
        ...prev,
        types: [category]
      }));
    }
  }, [location.search]);
  
  // Fetch products when filters or search term change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const products = await searchProducts(searchTerm, {
          colors: activeFilters.colors,
          occasions: activeFilters.occasions,
          types: activeFilters.types,
          priceRange: activeFilters.priceRange
        }, sortOption);
        
        setFilteredFlowers(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setFilteredFlowers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchTerm, activeFilters, sortOption]);
  
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = {...prev};
      
      if (filterType === "priceRange") {
        newFilters.priceRange = value as [number, number];
      } else if (Array.isArray(prev[filterType])) {
        if (prev[filterType].includes(value)) {
          // Remove filter if already selected
          newFilters[filterType] = prev[filterType].filter(item => item !== value);
        } else {
          // Add new filter
          newFilters[filterType] = [...prev[filterType], value];
        }
      }
      
      return newFilters;
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Search functionality is already handled by the useEffect
    }
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleClearAllFilters = () => {
    setActiveFilters({
      colors: [],
      occasions: [],
      types: [],
      priceRange: [0, 200],
    });
    setSearchTerm("");
    setSortOption("featured");
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Our Floral Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the perfect blooms for every occasion. Each flower is handpicked for its beauty and freshness.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <Sidebar 
              activeFilters={activeFilters} 
              onFilterChange={handleFilterChange}
              onClearAllFilters={handleClearAllFilters}
            />
          </div>
          
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-3 sm:mb-0">
                Showing <span className="font-medium">{filteredFlowers.length}</span> flowers
              </p>
              
              <div className="flex items-center">
                <label htmlFor="sortOrder" className="mr-2 text-gray-600">Sort by:</label>
                <select
                  id="sortOrder"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-floral-lavender focus:ring-floral-lavender"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                    <div className="mt-4 h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="mt-2 h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredFlowers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredFlowers.map((flower) => (
                  <FlowerCard key={flower.id} flower={flower} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <i className="fa-solid fa-magnifying-glass-minus text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No flowers found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                <Button 
                  onClick={handleClearAllFilters}
                  className="bg-floral-lavender hover:bg-opacity-90 text-white transition-colors"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Catalog;
