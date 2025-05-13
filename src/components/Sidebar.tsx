
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { flowerColors, flowerOccasions, flowerTypes } from "@/data/filters";
import { formatKztPrice } from "@/utils/currency";

const Sidebar = ({ activeFilters, onFilterChange, onClearAllFilters }) => {
  // Local state for the input fields
  const [minPriceInput, setMinPriceInput] = useState(activeFilters.priceRange[0].toString());
  const [maxPriceInput, setMaxPriceInput] = useState(activeFilters.priceRange[1].toString());
  const [localPriceRange, setLocalPriceRange] = useState(activeFilters.priceRange);

  // Update local inputs when activeFilters change from outside
  useEffect(() => {
    setMinPriceInput(activeFilters.priceRange[0].toString());
    setMaxPriceInput(activeFilters.priceRange[1].toString());
    setLocalPriceRange(activeFilters.priceRange);
  }, [activeFilters.priceRange]);

  const handleCheckboxChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Price range is now directly in KZT
  const minPrice = 0;
  const maxPrice = 90000; // Max price in KZT

  // Handle slider change
  const handleSliderChange = (value) => {
    setLocalPriceRange(value);
    setMinPriceInput(value[0].toString());
    setMaxPriceInput(value[1].toString());
    onFilterChange("priceRange", value);
  };

  // Handle input changes
  const handleMinPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMinPriceInput(value);
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMaxPriceInput(value);
  };

  // Apply price range from input fields
  const applyPriceRange = () => {
    const min = Math.max(minPrice, Number(minPriceInput) || 0);
    const max = Math.min(maxPrice, Number(maxPriceInput) || maxPrice);
    
    // Make sure min doesn't exceed max
    const validMin = Math.min(min, max);
    const validMax = Math.max(min, max);
    
    const newRange = [validMin, validMax];
    setLocalPriceRange(newRange);
    onFilterChange("priceRange", newRange);
  };

  // Handle input blur to apply changes
  const handleInputBlur = () => {
    applyPriceRange();
  };

  // Handle key press for Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyPriceRange();
      e.target.blur();
    }
  };

  return (
    <div className="space-y-8 sticky top-28 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-2">Фильтры</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAllFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Очистить все
        </Button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Диапазон цен</h3>
        <Slider
          value={localPriceRange}
          min={minPrice}
          max={maxPrice}
          step={1000}
          className="my-6"
          onValueChange={handleSliderChange}
        />
        
        {/* Added labeled input fields for price range */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs text-gray-500 mb-1 block">Минимальная цена</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₸</span>
              <Input
                id="min-price"
                value={minPriceInput}
                onChange={handleMinPriceChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                className="pl-7"
              />
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs text-gray-500 mb-1 block">Максимальная цена</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₸</span>
              <Input
                id="max-price"
                value={maxPriceInput}
                onChange={handleMaxPriceChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                className="pl-7"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatKztPrice(localPriceRange[0])}</span>
          <span>{formatKztPrice(localPriceRange[1])}</span>
        </div>
      </div>
      
      {/* Colors */}
      <div>
        <h3 className="font-medium mb-3">Цвета</h3>
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
        <h3 className="font-medium mb-3">Поводы</h3>
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
        <h3 className="font-medium mb-3">Типы</h3>
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
