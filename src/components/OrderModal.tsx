
import React from "react";
import { formatKztPrice } from "@/utils/currency";
import type { Order } from "@/contexts/OrdersContext";
import { Clock, MapPin, PackageCheck, User, Mail, BadgeCheck, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal = ({ order, isOpen, onClose }: OrderModalProps) => {
  if (!order) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const address = order.shipping_address || {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Order #{order.id?.slice(0, 8)}
            </p>
          </div>
          <Badge 
            variant={order.status === "paid" ? "default" : "outline"}
            className={order.status === "paid" 
              ? "bg-floral-sage text-black border-floral-sage" 
              : "border-floral-peach text-floral-peach"
            }
          >
            {order.status === "paid" ? (
              <><BadgeCheck className="w-3 h-3 mr-1" /> Paid</>
            ) : (
              <><X className="w-3 h-3 mr-1" /> Unpaid</>
            )}
          </Badge>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">Name</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customer_email}</p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Order Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(order.date || order.created_at || "")}</p>
                    <p className="text-sm text-gray-500">Order Date</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PackageCheck className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatKztPrice(order.total)}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-3">Shipping Address</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium">{address.street}</p>
                <p>{`${address.city}, ${address.state} ${address.postal_code}`}</p>
                <p>{address.country}</p>
                <p className="text-sm text-gray-500 mt-1">Delivery Address</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-3">Order Items</h3>
            
            <div className="space-y-4">
              {order.products.map((product) => (
                <div key={`${order.id}-${product.id}`} className="flex items-center gap-4 pb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 rounded-md object-cover" 
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Quantity: {product.quantity}</span>
                      <span className="mx-2">•</span>
                      <span>{formatKztPrice(product.price)} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatKztPrice(product.price * product.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
              <span>{formatKztPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <DialogClose className="bg-floral-lavender hover:bg-floral-lavender/90 text-white px-4 py-2 rounded-md">
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
