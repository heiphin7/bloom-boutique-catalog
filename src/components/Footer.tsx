
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <i className="fa-solid fa-seedling text-floral-lavender text-2xl mr-2"></i>
              <span className="font-playfair font-bold text-xl">Bloom & Petal</span>
            </div>
            <p className="text-gray-600 mb-4">
              Доставляем природную красоту к вашему порогу. Премиальные свежие цветы для всех случаев.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-brands fa-pinterest-p"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-floral-lavender transition-colors">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-phone text-floral-lavender mr-2"></i>
              <span className="text-gray-700">+7 (999) 123-4567</span>
            </div>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Магазин</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Все цветы</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Букеты</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Композиции</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Растения</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Подарки</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Сезонные</a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Компания</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">О нас</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Карьера</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Блог</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Экологичность</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Магазины</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-floral-lavender transition-colors">Связаться с нами</a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-medium text-lg mb-4">Рассылка</h4>
            <p className="text-gray-600 mb-4">
              Подпишитесь, чтобы получать обновления, доступ к эксклюзивным предложениям и многое другое.
            </p>
            <form className="mb-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Ваш email адрес" 
                  className="w-full border border-gray-200 rounded-full py-2 pl-4 pr-12 focus:border-floral-lavender focus:ring-1 focus:ring-floral-lavender focus:outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-floral-lavender text-white p-1 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <i className="fa-solid fa-paper-plane px-1"></i>
                </button>
              </div>
            </form>
            <div className="flex items-center space-x-2">
              <img src="https://via.placeholder.com/40x25" alt="Visa" />
              <img src="https://via.placeholder.com/40x25" alt="Mastercard" />
              <img src="https://via.placeholder.com/40x25" alt="American Express" />
              <img src="https://via.placeholder.com/40x25" alt="PayPal" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Bloom & Petal. Все права защищены.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-floral-lavender transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-sm text-gray-500 hover:text-floral-lavender transition-colors">Условия использования</a>
            <a href="#" className="text-sm text-gray-500 hover:text-floral-lavender transition-colors">Политика доставки</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
