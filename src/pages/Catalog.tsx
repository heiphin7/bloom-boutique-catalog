
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import Sidebar from "../components/Sidebar";
import { searchProducts } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const Catalog = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    colors: [],
    occasions: [],
    types: [],
    priceRange: [0, 90000] as [number, number], // Explicitly type as tuple
  });
  const [sortOption, setSortOption] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  
  // Parse query params on page load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search');
    const category = queryParams.get('category');
    const page = queryParams.get('page');
    
    if (search) {
      setSearchTerm(search);
    }
    
    if (category) {
      setActiveFilters(prev => ({
        ...prev,
        types: [category]
      }));
    }
    
    if (page) {
      setCurrentPage(parseInt(page));
    }
  }, [location.search]);
  
  // Fetch products when filters or search term change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching with filters:", activeFilters);
        
        // Get all products matching filters without pagination
        const products = await searchProducts(searchTerm, {
          colors: activeFilters.colors,
          occasions: activeFilters.occasions,
          types: activeFilters.types,
          priceRange: activeFilters.priceRange
        }, sortOption);
        
        console.log(`Total products before pagination: ${products.length}`);
        
        // Calculate total pages
        setTotalPages(Math.max(1, Math.ceil(products.length / itemsPerPage)));
        
        // Apply pagination to the filtered results
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = products.slice(start, end);
        
        setFilteredFlowers(paginatedProducts);
        console.log(`Showing page ${currentPage} of ${Math.ceil(products.length / itemsPerPage)}, ${paginatedProducts.length} products`);
      } catch (error) {
        console.error("Error fetching products:", error);
        setFilteredFlowers([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchTerm, activeFilters, sortOption, currentPage]);
  
  const handleFilterChange = (filterType, value) => {
    console.log(`Filter change: ${filterType} = ${value}`);
    
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
      
      // Reset to first page when filters change
      setCurrentPage(1);
      return newFilters;
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Search functionality is already handled by the useEffect
    }
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };
  
  const handleClearAllFilters = () => {
    setActiveFilters({
      colors: [],
      occasions: [],
      types: [],
      priceRange: [0, 90000],
    });
    setSearchTerm("");
    setSortOption("featured");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page, and some surrounding pages
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (startPage > 2) {
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Наша Коллекция Цветов</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Откройте для себя идеальные цветы для любого случая. Каждый цветок выбран вручную за его красоту и свежесть.
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
                Показано <span className="font-medium">{filteredFlowers.length}</span> цветов
              </p>
              
              <div className="flex items-center">
                <label htmlFor="sortOrder" className="mr-2 text-gray-600">Сортировать по:</label>
                <select
                  id="sortOrder"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-floral-lavender focus:ring-floral-lavender"
                >
                  <option value="featured">Рекомендуемые</option>
                  <option value="price-low-high">Цена: от низкой к высокой</option>
                  <option value="price-high-low">Цена: от высокой к низкой</option>
                  <option value="name-a-z">Название: от А до Я</option>
                  <option value="name-z-a">Название: от Я до А</option>
                  <option value="newest">Новинки</option>
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {filteredFlowers.map((flower) => (
                    <FlowerCard key={flower.id} flower={flower} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                      )}
                      
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === '...' ? (
                            <span className="flex h-9 w-9 items-center justify-center">...</span>
                          ) : (
                            <PaginationLink 
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <i className="fa-solid fa-magnifying-glass-minus text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Цветы не найдены</h3>
                <p className="text-gray-600 mb-4">Попробуйте изменить поисковый запрос или фильтры, чтобы найти то, что вы ищете.</p>
                <Button 
                  onClick={handleClearAllFilters}
                  className="bg-floral-lavender hover:bg-opacity-90 text-white transition-colors"
                >
                  Очистить все фильтры
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
