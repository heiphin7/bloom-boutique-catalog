
import React, { useState } from 'react';
import { flowerColors, flowerOccasions, flowerTypes } from '../data/filters';

const Sidebar = ({ activeFilters, onFilterChange, onClearAllFilters }) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    colors: true,
    occasions: true,
    types: true,
    price: true
  });
  
  const toggleFilterSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handlePriceRangeChange = (event) => {
    const value = parseInt(event.target.value);
    onFilterChange('priceRange', [0, value]);
  };
  
  const hasActiveFilters = () => {
    return (
      activeFilters.colors.length > 0 || 
      activeFilters.occasions.length > 0 || 
      activeFilters.types.length > 0 || 
      activeFilters.priceRange[1] < 200
    );
  };
  
  return (
    <>
      <div className="flex items-center justify-between lg:hidden mb-4">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex items-center text-gray-700 hover:text-floral-lavender transition-colors"
        >
          <i className="fa-solid fa-filter mr-2"></i>
          <span className="font-medium">Filters</span>
          <i className={`fa-solid ${isMobileFiltersOpen ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2 text-xs`}></i>
        </button>
        
        {hasActiveFilters() && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-floral-lavender hover:text-opacity-80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className={`bg-white rounded-lg shadow-sm p-5 ${isMobileFiltersOpen || 'lg:block hidden'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          {hasActiveFilters() && (
            <button
              onClick={onClearAllFilters}
              className="text-sm text-floral-lavender hover:text-opacity-80 transition-colors hidden lg:block"
            >
              Clear all
            </button>
          )}
        </div>
        
        {/* Color Filter */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <button 
            className="flex items-center justify-between w-full text-left mb-3"
            onClick={() => toggleFilterSection('colors')}
          >
            <h3 className="font-medium text-gray-800">Colors</h3>
            <i className={`fa-solid ${expandedSections.colors ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400 text-xs`}></i>
          </button>
          
          {expandedSections.colors && (
            <div className="space-y-2 mt-3 animate-fade-in">
              {flowerColors.map((color) => (
                <label key={color.value} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeFilters.colors.includes(color.value)}
                    onChange={() => onFilterChange('colors', color.value)}
                    className="rounded border-gray-300 text-floral-lavender focus:ring-floral-lavender h-4 w-4"
                  />
                  <div className="ml-3 flex items-center">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 mr-2"
                      style={{ backgroundColor: color.value }}
                    ></span>
                    <span className="text-gray-700 group-hover:text-floral-lavender transition-colors">
                      {color.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Occasion Filter */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <button 
            className="flex items-center justify-between w-full text-left mb-3"
            onClick={() => toggleFilterSection('occasions')}
          >
            <h3 className="font-medium text-gray-800">Occasions</h3>
            <i className={`fa-solid ${expandedSections.occasions ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400 text-xs`}></i>
          </button>
          
          {expandedSections.occasions && (
            <div className="space-y-2 mt-3 animate-fade-in">
              {flowerOccasions.map((occasion) => (
                <label key={occasion} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeFilters.occasions.includes(occasion)}
                    onChange={() => onFilterChange('occasions', occasion)}
                    className="rounded border-gray-300 text-floral-lavender focus:ring-floral-lavender h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-floral-lavender transition-colors">
                    {occasion}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Flower Type Filter */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <button 
            className="flex items-center justify-between w-full text-left mb-3"
            onClick={() => toggleFilterSection('types')}
          >
            <h3 className="font-medium text-gray-800">Flower Types</h3>
            <i className={`fa-solid ${expandedSections.types ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400 text-xs`}></i>
          </button>
          
          {expandedSections.types && (
            <div className="space-y-2 mt-3 animate-fade-in">
              {flowerTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeFilters.types.includes(type)}
                    onChange={() => onFilterChange('types', type)}
                    className="rounded border-gray-300 text-floral-lavender focus:ring-floral-lavender h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-floral-lavender transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Price Range Filter */}
        <div className="mb-3">
          <button 
            className="flex items-center justify-between w-full text-left mb-3"
            onClick={() => toggleFilterSection('price')}
          >
            <h3 className="font-medium text-gray-800">Price Range</h3>
            <i className={`fa-solid ${expandedSections.price ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400 text-xs`}></i>
          </button>
          
          {expandedSections.price && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">$0</span>
                <span className="text-gray-600">${activeFilters.priceRange[1]}</span>
                <span className="text-gray-600">$200</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={activeFilters.priceRange[1]}
                onChange={handlePriceRangeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-floral-lavender"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
