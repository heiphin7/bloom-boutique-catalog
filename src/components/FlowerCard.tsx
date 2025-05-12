
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const FlowerCard = ({ flower }) => {
  const badgeClass = flower.is_new ? 'badge-new' : flower.on_sale ? 'badge-sale' : flower.is_bestseller ? 'badge-bestseller' : '';
  const badgeText = flower.is_new ? 'New' : flower.on_sale ? 'Sale' : flower.is_bestseller ? 'Bestseller' : '';
  const { addToCart } = useCart();
  const { checkIsInWishlist, toggleItem } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  useEffect(() => {
    setIsInWishlist(checkIsInWishlist(flower.id));
  }, [checkIsInWishlist, flower.id]);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: flower.id,
      name: flower.name,
      price: flower.price,
      image: flower.image,
      quantity: 1
    });
  };
  
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleItem(flower);
    setIsInWishlist(checkIsInWishlist(flower.id));
  };
  
  return (
    <div className="catalog-card group animate-slide-up">
      {badgeText && <span className={`ribbon ${badgeClass}`}>{badgeText}</span>}
      
      <div className="relative overflow-hidden h-64">
        <img 
          src={flower.image} 
          alt={flower.name} 
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Link to={`/product/${flower.id}`} className="bg-white text-gray-800 rounded-full p-3 mx-1 hover:bg-floral-lavender hover:text-white transition-colors">
              <i className="fa-solid fa-eye"></i>
            </Link>
            <button 
              className={cn(
                "bg-white rounded-full p-3 mx-1 transition-colors",
                isInWishlist 
                  ? "text-red-500 hover:bg-red-500 hover:text-white" 
                  : "text-gray-800 hover:bg-floral-lavender hover:text-white"
              )}
              onClick={handleToggleWishlist}
            >
              <i className={`fa-${isInWishlist ? 'solid' : 'regular'} fa-heart`}></i>
            </button>
            <button 
              className="bg-white text-gray-800 rounded-full p-3 mx-1 hover:bg-floral-lavender hover:text-white transition-colors"
              onClick={handleAddToCart}
            >
              <i className="fa-solid fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
      
      <Link to={`/product/${flower.id}`} className="block p-4">
        <div className="flex items-center mb-1">
          {flower.colors && Array.isArray(flower.colors) && flower.colors.map((color, index) => (
            <span 
              key={index} 
              className="w-3 h-3 rounded-full mr-1 border border-gray-200" 
              style={{ backgroundColor: color }}
              title={color}
            ></span>
          ))}
        </div>
        
        <h3 className="text-lg font-medium mb-1">{flower.name}</h3>
        
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{flower.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {flower.on_sale ? (
              <>
                <span className="text-gray-400 line-through mr-2">${flower.original_price?.toFixed(2)}</span>
                <span className="text-floral-peach font-semibold">${flower.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-semibold">${flower.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <i 
                key={index} 
                className={`fa-solid fa-star text-xs ${
                  index < (flower.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              ></i>
            ))}
            <span className="text-xs text-gray-500 ml-1">({flower.review_count || 0})</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FlowerCard;
