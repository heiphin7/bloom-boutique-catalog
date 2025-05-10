
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const OrdersButton = ({ 
  variant = "default", 
  size = "default",
  className = ""
}: OrdersButtonProps) => {
  return (
    <Link to="/orders">
      <Button variant={variant} size={size} className={className}>
        <ShoppingBag className="mr-2 h-4 w-4" />
        My Orders
      </Button>
    </Link>
  );
};

export default OrdersButton;
