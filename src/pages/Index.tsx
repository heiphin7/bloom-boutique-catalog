
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import Sidebar from "../components/Sidebar";
import { flowers } from "../data/flowers";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlowers, setFilteredFlowers] = useState(flowers);
  const [activeFilters, setActiveFilters] = useState({
    colors: [],
    occasions: [],
    types: [],
    priceRange: [0, 200],
  });
  const [sortOption, setSortOption] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    let results = [...flowers];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(flower => 
        flower.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        flower.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply color filters
    if (activeFilters.colors.length > 0) {
      results = results.filter(flower => 
        activeFilters.colors.some(color => flower.colors.includes(color))
      );
    }
    
    // Apply occasion filters
    if (activeFilters.occasions.length > 0) {
      results = results.filter(flower => 
        activeFilters.occasions.some(occasion => flower.occasions.includes(occasion))
      );
    }
    
    // Apply type filters
    if (activeFilters.types.length > 0) {
      results = results.filter(flower => 
        activeFilters.types.includes(flower.type)
      );
    }
    
    // Apply price range filter
    results = results.filter(flower => 
      flower.price >= activeFilters.priceRange[0] && 
      flower.price <= activeFilters.priceRange[1]
    );
    
    // Apply sorting
    switch(sortOption) {
      case "price-low-high":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        results.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        results.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case "featured":
      default:
        results.sort((a, b) => b.featured - a.featured);
        break;
    }
    
    setFilteredFlowers(results);
  }, [searchTerm, activeFilters, sortOption]);
  
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = {...prev};
      
      if (filterType === "priceRange") {
        newFilters.priceRange = value;
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
      <Header searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      
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
                <button 
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-floral-lavender text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
