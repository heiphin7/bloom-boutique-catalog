
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { flowerColors, flowerOccasions, flowerTypes } from "@/data/filters";
import { formatKztPrice } from "@/utils/currency";

const Sidebar = ({ activeFilters, onFilterChange, onClearAllFilters }) => {
  const handleCheckboxChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Updated price range to use KZT
  const minPrice = 0;
  const maxPrice = 90000; // Assuming max price is 200 USD * 450 KZT = 90,000 KZT

  return (
    <div className="space-y-8 sticky top-28 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-2">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAllFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <Slider
          value={activeFilters.priceRange}
          min={minPrice}
          max={maxPrice}
          step={1000}
          className="my-6"
          onValueChange={(value) => onFilterChange("priceRange", value)}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatKztPrice(activeFilters.priceRange[0])}</span>
          <span>{formatKztPrice(activeFilters.priceRange[1])}</span>
        </div>
      </div>
      
      {/* Colors */}
      <div>
        <h3 className="font-medium mb-3">Colors</h3>
        <div className="space-y-2">
          {flowerColors.map((color) => (
            <div key={color.value} className="flex items-center">
              <Checkbox
                id={`color-${color.value}`}
                checked={activeFilters.colors.includes(color.label)}
                onCheckedChange={() => handleCheckboxChange("colors", color.label)}
              />
              <Label htmlFor={`color-${color.value}`} className="ml-2 text-sm cursor-pointer flex items-center">
                <span className="h-4 w-4 mr-2 rounded-full" style={{ backgroundColor: color.value }}></span>
                {color.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Occasions */}
      <div>
        <h3 className="font-medium mb-3">Occasions</h3>
        <div className="space-y-2">
          {flowerOccasions.map((occasion) => (
            <div key={occasion} className="flex items-center">
              <Checkbox
                id={`occasion-${occasion}`}
                checked={activeFilters.occasions.includes(occasion)}
                onCheckedChange={() => handleCheckboxChange("occasions", occasion)}
              />
              <Label htmlFor={`occasion-${occasion}`} className="ml-2 text-sm cursor-pointer">
                {occasion}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Types */}
      <div>
        <h3 className="font-medium mb-3">Types</h3>
        <div className="space-y-2">
          {flowerTypes.map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                id={`type-${type}`}
                checked={activeFilters.types.includes(type)}
                onCheckedChange={() => handleCheckboxChange("types", type)}
              />
              <Label htmlFor={`type-${type}`} className="ml-2 text-sm cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
