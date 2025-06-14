
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "../contexts/CartContext";
import { useOrders } from "../contexts/OrdersContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { formatKztPrice } from "@/utils/currency";

const OrderDetails = () => {
  const { cartItems, getCartTotal, refreshCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Казахстан"
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Refresh cart on mount
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };
  
  // Calculate total amount
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal < 22500 ? 1000 : 0) : 0;
  const total = subtotal + shipping;

  const handleProceedToCheckout = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    // Validate form
    if (!email || !name || !address.street || !address.city || !address.state || !address.postal_code) {
      setError("Пожалуйста, заполните все обязательные поля");
      setLoading(false);
      return;
    }

    try {
      // Create order in database (initially with unpaid status)
      const orderData = {
        customer_name: name,
        customer_email: email,
        shipping_address: address,
        total: total,
        status: "unpaid" as const,
        products: cartItems
      };
      
      console.log("Creating order with data:", orderData);
      const orderId = await addOrder(orderData);
      
      if (!orderId) {
        setError("Не удалось создать заказ. Пожалуйста, попробуйте снова.");
        setLoading(false);
        return;
      }
      
      console.log("Order created successfully:", orderId);
      
      // Create Stripe checkout session
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          orderId,
          cartItems,
          customerInfo: { name, email }
        }
      });
      
      if (checkoutError) {
        console.error("Checkout error:", checkoutError);
        toast({
          title: "Ошибка",
          description: "Не удалось создать сессию оплаты. Пожалуйста, попробуйте снова.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!data || !data.url) {
        setError("Недопустимый ответ от сервиса оплаты");
        setLoading(false);
        return;
      }
      
      console.log("Checkout session created:", data);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (e) {
      console.error("Checkout error:", e);
      const errorMessage = e instanceof Error ? e.message : "Произошла неизвестная ошибка";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onSearchKeyDown={handleSearchKeyDown}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400">
              <ShoppingCart size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Ваша корзина пуста</h2>
            <p className="text-gray-600 mb-8">Добавьте товары в корзину перед оформлением заказа.</p>
            <Link to="/">
              <Button className="bg-floral-lavender hover:bg-floral-lavender/90">
                Начать покупки
              </Button>
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
        onSearchKeyDown={handleSearchKeyDown}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-floral-lavender">Главная</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/cart" className="text-gray-500 hover:text-floral-lavender">Корзина</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Оформление заказа</span>
        </nav>
        
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Сводка заказа</CardTitle>
                <CardDescription>Проверьте ваш заказ перед оформлением</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md mr-2" />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Кол-во: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatKztPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Подытог</span>
                    <span>{formatKztPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Доставка</span>
                    <span>{shipping > 0 ? formatKztPrice(shipping) : 'Бесплатно'}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-gray-500">
                      Бесплатная доставка при заказе от {formatKztPrice(22500)}
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-base pt-2 border-t">
                    <span>Итого</span>
                    <span className="text-floral-peach">{formatKztPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link to="/cart" className="w-full">
                  <Button variant="outline" className="w-full border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10">
                    Редактировать корзину
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Customer Information Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Информация о покупателе</CardTitle>
                <CardDescription>
                  Введите ваши данные для оформления заказа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProceedToCheckout} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="Иван Иванов" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="ivan@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Адрес</Label>
                      <Input 
                        id="street" 
                        type="text" 
                        placeholder="ул. Ленина, 123" 
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Город</Label>
                        <Input 
                          id="city" 
                          type="text" 
                          placeholder="Алматы" 
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Область/Регион</Label>
                        <Input 
                          id="state" 
                          type="text" 
                          placeholder="Алматинская обл." 
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Почтовый индекс</Label>
                        <Input 
                          id="postal_code" 
                          type="text" 
                          placeholder="050000" 
                          value={address.postal_code}
                          onChange={(e) => setAddress({...address, postal_code: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Страна</Label>
                        <Input 
                          id="country" 
                          type="text" 
                          value={address.country}
                          onChange={(e) => setAddress({...address, country: e.target.value})}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-floral-lavender hover:bg-floral-lavender/90" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Обработка...
                      </div>
                    ) : (
                      <>Перейти к оплате • {formatKztPrice(total)}</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetails;
