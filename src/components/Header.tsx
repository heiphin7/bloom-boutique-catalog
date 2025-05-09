
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Header = ({ searchTerm = '', onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-100 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-solid fa-location-dot"></i>
                <span className="ml-1 text-sm">Store Locator</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-solid fa-phone"></i>
                <span className="ml-1 text-sm">+1 (555) 123-4567</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-solid fa-truck-fast"></i>
                <span className="ml-1 text-sm">Order Tracking</span>
              </a>
              <div className="h-4 w-px bg-gray-200"></div>
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-solid fa-user"></i>
                <span className="ml-1 text-sm">Account</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <i className="fa-solid fa-seedling text-floral-lavender text-3xl mr-2"></i>
              <span className="font-playfair font-bold text-2xl">Bloom & Petal</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={onSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchChange(e as any)}
                  placeholder="Search for flowers..."
                  className="w-full border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:border-floral-lavender focus:ring-1 focus:ring-floral-lavender focus:outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="#" className="relative hidden sm:flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
              <i className="fa-solid fa-heart text-gray-600"></i>
              <span className="absolute -top-1 -right-1 bg-floral-lavender text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </a>
            <Link to="/cart" className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
              <i className="fa-solid fa-cart-shopping text-gray-600"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-floral-lavender text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-gray-600`}></i>
            </button>
          </div>
        </div>
        
        <div className="md:hidden py-3 border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={onSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && onSearchChange(e as any)}
              placeholder="Search for flowers..."
              className="w-full border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:border-floral-lavender focus:ring-1 focus:ring-floral-lavender focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex py-3 border-t border-gray-100">
          <ul className="flex space-x-8">
            <li>
              <a href="#" className="font-medium hover:text-floral-lavender transition-colors">Home</a>
            </li>
            <li>
              <a href="#" className="font-medium text-floral-lavender border-b-2 border-floral-lavender pb-1">Shop</a>
            </li>
            <li>
              <a href="#" className="font-medium hover:text-floral-lavender transition-colors">Collections</a>
            </li>
            <li>
              <a href="#" className="font-medium hover:text-floral-lavender transition-colors">Occasions</a>
            </li>
            <li>
              <a href="#" className="font-medium hover:text-floral-lavender transition-colors">About Us</a>
            </li>
            <li>
              <a href="#" className="font-medium hover:text-floral-lavender transition-colors">Contact</a>
            </li>
          </ul>
        </nav>
        
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <ul className="space-y-4">
              <li>
                <a href="#" className="block font-medium hover:text-floral-lavender transition-colors">Home</a>
              </li>
              <li>
                <a href="#" className="block font-medium text-floral-lavender">Shop</a>
              </li>
              <li>
                <a href="#" className="block font-medium hover:text-floral-lavender transition-colors">Collections</a>
              </li>
              <li>
                <a href="#" className="block font-medium hover:text-floral-lavender transition-colors">Occasions</a>
              </li>
              <li>
                <a href="#" className="block font-medium hover:text-floral-lavender transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="block font-medium hover:text-floral-lavender transition-colors">Contact</a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
