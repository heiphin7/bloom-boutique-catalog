
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "../contexts/CartContext";

type HeaderProps = {
  searchTerm?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const Header: React.FC<HeaderProps> = ({ 
  searchTerm = "", 
  onSearchChange = () => {}, 
  onSearchKeyDown = () => {} 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getItemCount } = useCart();
  
  const cartItemCount = getItemCount();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (searchOpen) setSearchOpen(false);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${searchTerm.trim()}`);
      setSearchOpen(false);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-playfair font-bold text-floral-lavender">Blossom</span>
              <span className="ml-2 text-2xl font-playfair font-light">Boutique</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-floral-lavender",
                location.pathname === "/" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Home
            </Link>
            <Link 
              to="/catalog" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-floral-lavender",
                location.pathname === "/catalog" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Catalog
            </Link>
            <Link 
              to="/about" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-floral-lavender",
                location.pathname === "/about" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-floral-lavender",
                location.pathname === "/contact" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Contact
            </Link>
            <Link 
              to="/payment" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-floral-lavender",
                location.pathname === "/payment" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Payment
            </Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-3 pr-10"
                value={searchTerm}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
            <Link to="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-floral-lavender text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSearch}
              className={cn(searchOpen && "bg-gray-100")}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-floral-lavender text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-3 pr-10"
                value={searchTerm}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>
        )}
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t space-y-3">
            <Link 
              to="/" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/catalog" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/catalog" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link 
              to="/about" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/about" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/contact" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/payment" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/payment" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Payment
            </Link>
            <Link 
              to="/account" 
              className={cn(
                "block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md",
                location.pathname === "/account" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Account
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
