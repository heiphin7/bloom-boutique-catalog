
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingBag, CreditCard, Filter, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOrders } from "../contexts/OrdersContext";
import { supabase } from "@/integrations/supabase/client";
import { formatKztPrice } from "@/utils/currency";
import OrderModal from "@/components/OrderModal";
import type { Order } from "@/contexts/OrdersContext";

const Orders = () => {
  const { orders, loading, refreshOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check for URL parameters when component mounts
  useEffect(() => {
    // Check for canceled parameter
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      toast({
        title: "Оплата отменена",
        description: "Процесс оплаты был отменен. Вы можете продолжить покупки или повторить попытку.",
        variant: "destructive"
      });
      // Clean up URL
      navigate('/orders', { replace: true });
    }
    
    // Refresh orders on page load
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/?search=' + searchTerm.trim());
    }
  };
  
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const productsMatch = order.products.some(product => 
        product.name.toLowerCase().includes(term)
      );
      return productsMatch || order.id.toLowerCase().includes(term) || 
             order.customer_name.toLowerCase().includes(term);
    }
    
    return true;
  });
  
  const handlePayment = async (orderId) => {
    try {
      setVerifyingPayment(true);
      
      // Get order details
      const orderToProcess = orders.find(o => o.id === orderId);
      if (!orderToProcess) {
        toast({
          title: "Ошибка",
          description: "Заказ не найден",
          variant: "destructive"
        });
        setVerifyingPayment(false);
        return;
      }
      
      // Create a new checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          orderId,
          cartItems: orderToProcess.products,
          customerInfo: { 
            name: orderToProcess.customer_name,
            email: orderToProcess.customer_email
          }
        }
      });
      
      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось создать сессию оплаты.",
          variant: "destructive"
        });
        setVerifyingPayment(false);
        return;
      }
      
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный ответ от сервиса оплаты",
          variant: "destructive"
        });
        setVerifyingPayment(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive"
      });
      setVerifyingPayment(false);
    }
  };
  
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading || verifyingPayment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onSearchKeyDown={handleSearchKeyDown}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-floral-lavender mb-4"></div>
            {verifyingPayment && <p className="text-lg text-gray-600">Проверка статуса оплаты...</p>}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if we just returned from a successful Stripe payment
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  
  if (success === 'true' && sessionId) {
    // Show a temporary payment processing message while we verify
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onSearchKeyDown={handleSearchKeyDown}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12 pt-6">
          <div className="flex flex-col justify-center items-center h-96">
            <AlertCircle className="h-16 w-16 text-floral-lavender mb-4" />
            <h2 className="text-2xl font-bold mb-2">Обработка платежа</h2>
            <p className="text-gray-600">Мы подтверждаем вашу оплату через Stripe...</p>
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
          <span className="text-gray-800">Заказы</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Мои заказы</h1>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setFilterStatus(filterStatus === "all" ? "paid" : filterStatus === "paid" ? "unpaid" : "all")}
              >
                <Filter className="h-4 w-4" />
                {filterStatus === "all" ? "Все заказы" : filterStatus === "paid" ? "Только оплаченные" : "Только неоплаченные"}
              </Button>
            </div>
            
            <Link to="/">
              <Button variant="outline" size="sm">Продолжить покупки</Button>
            </Link>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6 text-gray-400">
              <ShoppingBag size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Заказы не найдены</h2>
            <p className="text-gray-600 mb-8">
              {searchTerm || filterStatus !== "all" 
                ? "Попробуйте изменить параметры поиска или фильтра." 
                : "Вы еще не разместили ни одного заказа."}
            </p>
            <Link to="/">
              <Button className="bg-floral-lavender hover:bg-floral-lavender/90">
                Начать покупки
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Заказ #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>Размещен {new Date(order.date || order.created_at || "").toLocaleDateString()}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={order.status === "paid" ? "default" : "outline"}
                        className={order.status === "paid" 
                          ? "bg-floral-sage text-black border-floral-sage" 
                          : "border-floral-peach text-floral-peach"
                        }
                      >
                        {order.status === "paid" ? (
                          <><Check className="w-3 h-3 mr-1" /> Оплачен</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Не оплачен</>
                        )}
                      </Badge>
                      <span className="font-medium">{formatKztPrice(order.total)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead className="text-right">Количество</TableHead>
                        <TableHead className="text-right">Цена</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.products.map((product) => (
                        <TableRow key={`${order.id}-${product.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-12 h-12 rounded-md object-cover" 
                              />
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">{formatKztPrice(product.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                
                <CardFooter className="bg-gray-50 flex justify-between">
                  <div className="text-sm text-gray-600">
                    Итого: <span className="font-medium">{formatKztPrice(order.total)}</span>
                  </div>
                  
                  {order.status === "unpaid" && (
                    <Button 
                      onClick={() => handlePayment(order.id)}
                      className="bg-floral-lavender hover:bg-floral-lavender/90"
                      disabled={verifyingPayment}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {verifyingPayment ? "Обработка..." : "Оплатить сейчас"}
                    </Button>
                  )}
                  
                  {order.status === "paid" && (
                    <Button 
                      variant="outline"
                      onClick={() => openOrderDetails(order)}
                    >
                      Подробности
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Order Details Modal */}
        <OrderModal 
          order={selectedOrder} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;
