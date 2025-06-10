import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useScrollToTop, useScrollToTopOnMount } from "@/hooks/useScrollToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  MapPin,
  FileText,
  Truck,
  Clock,
  CheckCircle,
  ShoppingCart,
  Eye,
} from "lucide-react";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { scrollToTop } = useScrollToTop();
  
  // Scroll to top on page load
  useScrollToTopOnMount();

  // Get orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const OrderProgress = ({ status }: { status: string }) => {
    const steps = ["placed", "confirmed", "out_for_delivery", "delivered"];
    const currentStepIndex = steps.indexOf(status);

    return (
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                index <= currentStepIndex
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >
              {getStatusIcon(step)}
            </div>
            <span className="text-xs text-center mt-1 text-muted-foreground">
              {formatStatus(step)}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 mt-4 ${
                  index < currentStepIndex ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/medicines">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Medicines
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{formatStatus(order.status)}</span>
                  </Badge>
                  <p className="text-lg font-semibold mt-1">₹{order.totalAmount}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Order Progress */}
              <OrderProgress status={order.status} />

              {/* Order Items Summary */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items ({order.items?.length || 0})</h4>
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{item.medicine?.name}</span>
                        <span className="text-muted-foreground">× {item.quantity}</span>
                      </div>
                      <span>₹{item.totalPrice}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                      <div className="space-y-6">
                        {/* Order Status */}
                        <div>
                          <h4 className="font-semibold mb-3">Order Progress</h4>
                          <OrderProgress status={selectedOrder.status} />
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="font-semibold mb-3">Items</h4>
                          <div className="space-y-3">
                            {selectedOrder.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.medicine?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      ₹{item.unitPrice} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-semibold">₹{item.totalPrice}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount</span>
                            <span>₹{selectedOrder.totalAmount}</span>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <h4 className="font-semibold mb-3">Delivery Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Payment Method:</strong> Cash on Delivery</p>
                            <p><strong>Order Date:</strong> {new Date(selectedOrder.placedAt).toLocaleDateString("en-IN")}</p>
                            {selectedOrder.deliveredAt && (
                              <p><strong>Delivered:</strong> {new Date(selectedOrder.deliveredAt).toLocaleDateString("en-IN")}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {order.status === "delivered" && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
