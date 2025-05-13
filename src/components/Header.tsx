
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, X, LogOut, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  const { user, signOut, profile } = useAuth();
  
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
                "text-base font-normal font-manrope transition-colors hover:text-floral-lavender",
                location.pathname === "/" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Главная
            </Link>
            <Link 
              to="/catalog" 
              className={cn(
                "text-base font-normal font-manrope transition-colors hover:text-floral-lavender",
                location.pathname === "/catalog" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Каталог
            </Link>
            <Link 
              to="/payment" 
              className={cn(
                "text-base font-normal font-manrope transition-colors hover:text-floral-lavender",
                location.pathname === "/payment" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Оплата
            </Link>
            <Link 
              to="/orders" 
              className={cn(
                "text-base font-normal font-manrope transition-colors hover:text-floral-lavender",
                location.pathname === "/orders" ? "text-floral-lavender" : "text-foreground"
              )}
            >
              Заказы
            </Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
              <Input
                type="search"
                placeholder="Поиск..."
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
                <span className="sr-only">Поиск</span>
              </Button>
            </form>
            
            {/* User dropdown - Using Popover instead of DropdownMenu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Аккаунт</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-0" style={{ position: "fixed" }}>
                <div className="p-2">
                  {user ? (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {profile?.name || user.email}
                      </div>
                      <div className="h-px bg-muted my-1" />
                      <Link to="/orders" className="flex items-center px-2 py-1.5 text-sm hover:bg-muted hover:text-accent-foreground rounded-sm w-full cursor-pointer">
                        Мои заказы
                      </Link>
                      <Link to="/wishlist" className="flex items-center px-2 py-1.5 text-sm hover:bg-muted hover:text-accent-foreground rounded-sm w-full cursor-pointer">
                        Мой список желаний
                      </Link>
                      <div className="h-px bg-muted my-1" />
                      <button onClick={() => signOut()} className="flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-muted hover:text-red-600 rounded-sm w-full cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Выйти
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" className="flex items-center px-2 py-1.5 text-sm hover:bg-muted hover:text-accent-foreground rounded-sm w-full cursor-pointer">
                      Войти
                    </Link>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Wishlist button */}
            {user && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Список желаний</span>
                </Button>
              </Link>
            )}
            
            {/* Cart button */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Корзина</span>
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
              <span className="sr-only">Поиск</span>
            </Button>
            
            {/* Mobile Wishlist button */}
            {user && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Список желаний</span>
                </Button>
              </Link>
            )}
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Корзина</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-floral-lavender text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Меню</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Поиск..."
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
                <span className="sr-only">Поиск</span>
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
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/catalog" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/catalog" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link 
              to="/about" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/about" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              О нас
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/contact" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Контакты
            </Link>
            <Link 
              to="/payment" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/payment" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Оплата
            </Link>
            <Link 
              to="/orders" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/orders" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Заказы
            </Link>
            <Link 
              to="/wishlist" 
              className={cn(
                "block px-2 py-1.5 text-base font-semibold hover:bg-gray-100 rounded-md",
                location.pathname === "/wishlist" ? "text-floral-lavender" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Список желаний
            </Link>

            {user ? (
              <>
                <div className="px-2 py-1.5 text-base font-medium text-foreground">
                  {profile?.name || user.email}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-2 py-1.5 text-base font-medium text-red-600 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Выйти
                </Button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="block px-2 py-1.5 text-base font-medium hover:bg-gray-100 rounded-md text-floral-lavender"
                onClick={() => setMobileMenuOpen(false)}
              >
                Войти
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
