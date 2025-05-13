
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-floral-lavender mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-800 mb-6">Страница не найдена</p>
        <p className="text-lg text-gray-600 mb-8">
          Извините, страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Button asChild className="bg-floral-lavender hover:bg-floral-lavender/90 text-white">
          <Link to={user ? "/" : "/auth"}>
            Вернуться на {user ? "Главную" : "Страницу входа"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
