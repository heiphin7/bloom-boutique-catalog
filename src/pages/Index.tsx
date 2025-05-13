import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlowerCard from "../components/FlowerCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Gift, Heart, ShieldCheck, Truck } from "lucide-react";
import { getRandomProducts } from "@/services/productService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [randomFlowers, setRandomFlowers] = useState([]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        window.location.href = `/catalog?search=${searchTerm.trim()}`;
      }
    }
  };
  
  useEffect(() => {
    const loadRandomProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getRandomProducts(3);
        setRandomFlowers(products);
      } catch (error) {
        console.error("Error loading random products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRandomProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
      />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-floral-cream to-floral-mint overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                  Изысканные цветы для каждого <span className="text-floral-lavender">случая</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-md">
                  Откройте для себя наш тщательно отобранный ассортимент высококачественных цветов, доставляемых свежими к вашему порогу для важных моментов.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-floral-lavender hover:bg-floral-lavender/90 text-white"
                    asChild
                  >
                    <Link to="/catalog">
                      Просмотреть коллекцию <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-floral-lavender text-floral-lavender hover:bg-floral-lavender/10"
                    asChild
                  >
                    <Link to="/about">Узнать больше</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-floral-pink rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-floral-sage rounded-full opacity-20 blur-3xl"></div>
                <img 
                  src="https://rosepng.com/wp-content/uploads/2024/03/s11728_flower_bouquet_isolated_on_white_background_-stylize__43aa6cfc-3c7c-4ecb-9c7b-ff75ffb77c8c_0-photoroom-png-photoroom_11zon.png" 
                  alt="Красочный букет цветов" 
                  className="relative z-10 rounded-lg shadow-xl animate-slide-up object-cover h-[450px] w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Почему выбирают наши цветы</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Мы гордимся качеством, устойчивостью и исключительным сервисом
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Премиум качество</h3>
                <p className="text-gray-600">Отборные цветы, полученные из лучших садов по всему миру.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
                <p className="text-gray-600">Доставка в тот же день доступна для заказов, размещенных до 14:00 по местному времени.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Гарантия свежести</h3>
                <p className="text-gray-600">Наши цветы остаются свежими не менее 7 дней или мы вернем вам деньги.</p>
              </div>
              
              <div className="bg-floral-cream p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-floral-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-floral-lavender" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Сделано с любовью</h3>
                <p className="text-gray-600">Каждая композиция тщательно создана нашими опытными флористами.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gradient-to-b from-white to-floral-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Популярные композиции</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Популярный выбор, полюбившийся нашим клиентам
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {randomFlowers.map((flower) => (
                <FlowerCard key={flower.id} flower={flower} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="bg-floral-lavender hover:bg-floral-lavender/90 text-white"
                asChild
              >
                <Link to="/catalog">
                  Просмотреть все коллекции <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-floral-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Часто задаваемые вопросы
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ответы на популярные вопросы о наших цветах и услугах
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm p-6">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium text-gray-800">
                    Как долго сохраняются ваши цветы?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Наши цветы сохраняют свежесть не менее 7 дней при правильном уходе. Мы рекомендуем менять воду каждые 2 дня, обрезать стебли под углом и хранить букеты вдали от прямых солнечных лучей и источников тепла.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium text-gray-800">
                    Доставляете ли вы в день заказа?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Да, мы предлагаем доставку в тот же день для заказов, размещенных до 14:00 по местному времени. Для заказов после этого времени доставка будет осуществлена на следующий день.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium text-gray-800">
                    Можно ли изменить состав букета?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Да, мы готовы адаптировать наши букеты под ваши предпочтения. Пожалуйста, укажите ваши пожелания в комментариях к заказу или свяжитесь с нами напрямую для индивидуального оформления.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium text-gray-800">
                    Есть ли у вас система скидок для постоянных клиентов?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Да, у нас есть программа лояльности для постоянных клиентов. После пятого заказа вы автоматически получаете 10% скидку на все последующие покупки. Кроме того, мы регулярно проводим сезонные акции и специальные предложения.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium text-gray-800">
                    Что делать, если я получил поврежденные цветы?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Мы гарантируем качество наших цветов. Если вы получили поврежденные цветы, пожалуйста, сфотографируйте их и свяжитесь с нами в течение 24 часов. Мы заменим букет или вернем деньги в зависимости от ваших предпочтений.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
