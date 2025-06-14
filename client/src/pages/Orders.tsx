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
      !['delivered', 'cancelled'].includes(order.status)
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
      case "pending_prescription_review":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
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
      case "pending_prescription_review":
        return <FileText className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const OrderProgress = ({ status }: { status: string }) => {
    // Different progress flows based on order type
    const getStepsForStatus = (currentStatus: string) => {
      if (currentStatus === "pending_prescription_review") {
        return [
          { key: "placed", label: "Order Placed", icon: FileText },
          { key: "pending_prescription_review", label: "Prescription Review", icon: FileText },
          { key: "confirmed", label: "Confirmed", icon: CheckCircle },
          { key: "delivered", label: "Delivered", icon: Package },
        ];
      }
      
      return [
        { key: "placed", label: "Order Placed", icon: FileText },
        { key: "confirmed", label: "Confirmed", icon: CheckCircle },
        { key: "processing", label: "Processing", icon: Package },
        { key: "shipped", label: "Shipped", icon: Truck },
        { key: "delivered", label: "Delivered", icon: Package },
      ];
    };

    const steps = getStepsForStatus(status);

    const currentStepIndex = steps.findIndex((step) => step.key === status);

    return (
      <div className="mb-6">
        {/* Mobile Progress - Vertical */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-3">
                  <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Desktop Progress - Horizontal */}
        <div className="hidden md:flex items-center justify-between">
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
      </div>
    );
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="overflow-hidden">
      <CardHeader className="bg-muted/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Order #{order.orderNumber}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
            <Badge className={`${getStatusColor(order.status)} text-xs`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{formatStatus(order.status)}</span>
            </Badge>
            <p className="text-lg font-semibold">₹{order.totalAmount}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Order Progress */}
        <OrderProgress status={order.status} />

        {/* Order Items Summary */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">Order Items ({order.items?.length || 0})</h4>
          <div className="space-y-2">
            {order.items?.slice(0, 2).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{item.medicine?.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">× {item.quantity}</span>
                </div>
                <span className="font-medium ml-2">₹{item.totalPrice}</span>
              </div>
            ))}
            {order.items?.length > 2 && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                +{order.items.length - 2} more items
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl h-[85vh] sm:h-[90vh] p-0 gap-0">
              <div className="flex flex-col h-full">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
                  <DialogTitle className="text-lg sm:text-xl">Order #{order.orderNumber}</DialogTitle>
                </DialogHeader>
                
                {selectedOrder && (
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Order Progress - Responsive */}
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <OrderProgress status={selectedOrder.status} />
                      </div>
                      
                      {/* Order Items - Mobile Optimized */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm sm:text-base">Order Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item: any) => (
                            <div key={item.id} className="border rounded-lg p-3">
                              {/* Mobile: Stack vertically, Desktop: Side by side */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm sm:text-base truncate">{item.medicine?.name}</p>
                                    <div className="flex flex-col xs:flex-row xs:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                                      <span>Qty: {item.quantity}</span>
                                      <span>Unit: ₹{item.unitPrice}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right sm:ml-4">
                                  <p className="font-semibold text-sm sm:text-base">₹{item.totalPrice}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Address and Summary - Stack on mobile */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-sm sm:text-base">Billing Address</h4>
                          <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">{selectedOrder.billingAddress?.fullName}</p>
                              <p>{selectedOrder.billingAddress?.addressLine1}</p>
                              {selectedOrder.billingAddress?.addressLine2 && (
                                <p>{selectedOrder.billingAddress.addressLine2}</p>
                              )}
                              <p>{selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.state}</p>
                              <p>{selectedOrder.billingAddress?.postalCode}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3 text-sm sm:text-base">Order Summary</h4>
                          <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>₹{selectedOrder.totalAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery:</span>
                                <span className="text-green-600">Free</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold text-sm sm:text-base">
                                <span>Total:</span>
                                <span>₹{selectedOrder.totalAmount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track and manage your order history</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto gap-2">
          <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Active Orders</span>
            <span className="xs:hidden">Active</span>
            <span className="text-xs">({activeOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Delivered Orders</span>
            <span className="xs:hidden">Delivered</span>
            <span className="text-xs">({deliveredOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 sm:space-y-6">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-2xl font-semibold mb-2">No Active Orders</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  You don't have any active orders at the moment.
                </p>
                <Link href="/medicines">
                  <Button size="sm" className="w-full sm:w-auto">
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

        <TabsContent value="delivered" className="space-y-4 sm:space-y-6">
          {deliveredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-2xl font-semibold mb-2">No Delivered Orders</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Your delivered orders will appear here once you complete some purchases.
                </p>
                <Link href="/medicines">
                  <Button size="sm" className="w-full sm:w-auto">
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