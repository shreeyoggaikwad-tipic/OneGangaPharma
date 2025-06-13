import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useScrollToTop, useScrollToTopOnMount } from "@/hooks/useScrollToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RotateCcw,
} from "lucide-react";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { scrollToTop } = useScrollToTop();
  
  // Scroll to top on page load
  useScrollToTopOnMount();

  // Get orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Categorize orders
  const { activeOrders, deliveredOrders } = useMemo(() => {
    const active = (orders as any[]).filter(order => 
      ['placed', 'confirmed', 'out_for_delivery'].includes(order.status)
    );
    const delivered = (orders as any[]).filter(order => 
      order.status === 'delivered'
    );
    return { activeOrders: active, deliveredOrders: delivered };
  }, [orders]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderItems: any[]) => {
      const promises = orderItems.map(item => 
        apiRequest("POST", "/api/cart", {
          medicineId: item.medicine.id,
          quantity: item.quantity,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Items added to cart successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive",
      });
    },
  });

  const handleReorder = (order: any) => {
    if (order.items && order.items.length > 0) {
      reorderMutation.mutate(order.items);
    }
  };

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
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const OrderProgress = ({ status }: { status: string }) => {
    const steps = [
      { key: "placed", label: "Order Placed", icon: FileText },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle },
      { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
      { key: "delivered", label: "Delivered", icon: Package },
    ];

    const currentStepIndex = steps.findIndex((step) => step.key === status);

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStepIndex;
          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 mt-4 ${
                    index < currentStepIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrderCard = (order: any) => (
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
          <h4 className="font-semibold mb-2">Order Items ({order.items?.length || 0})</h4>
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

        {/* Action Buttons */}
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
                <DialogTitle>Order #{order.orderNumber}</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6">
                  <OrderProgress status={selectedOrder.status} />
                  
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{item.medicine?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} | Unit Price: ₹{item.unitPrice}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">₹{item.totalPrice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Billing Address</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{selectedOrder.billingAddress?.fullName}</p>
                        <p>{selectedOrder.billingAddress?.addressLine1}</p>
                        {selectedOrder.billingAddress?.addressLine2 && (
                          <p>{selectedOrder.billingAddress.addressLine2}</p>
                        )}
                        <p>{selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.state}</p>
                        <p>{selectedOrder.billingAddress?.postalCode}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{selectedOrder.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₹{selectedOrder.tax}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>₹{selectedOrder.shippingCost}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₹{selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {order.status === "delivered" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleReorder(order)}
              disabled={reorderMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {reorderMutation.isPending ? "Adding..." : "Reorder"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

  if ((orders as any[]).length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
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
        <p className="text-muted-foreground">Track and manage your order history</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Delivered Orders ({deliveredOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Active Orders</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have any active orders at the moment.
                </p>
                <Link href="/medicines">
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map(renderOrderCard)
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-6">
          {deliveredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Delivered Orders</h2>
                <p className="text-muted-foreground mb-6">
                  Your delivered orders will appear here once you complete some purchases.
                </p>
                <Link href="/medicines">
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Medicines
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            deliveredOrders.map(renderOrderCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}