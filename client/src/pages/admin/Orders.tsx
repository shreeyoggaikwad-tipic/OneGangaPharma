import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Eye,
  Check,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Activity,
  Archive,
  RefreshCw,
  FileText,
} from "lucide-react";

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Get all orders
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status }),
    onSuccess: (updatedOrder: any) => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      // Update selectedOrder state immediately to show payment UI
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder({ ...selectedOrder, status: updatedOrder.status });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: number; paymentStatus: string }) =>
      apiRequest("PUT", `/api/admin/orders/${orderId}/payment-status`, { paymentStatus }),
    onSuccess: (updatedOrder: any) => {
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-analytics"] });
      // Update selectedOrder state with new payment status
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: updatedOrder.paymentStatus });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_prescription_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending_prescription_review":
        return <AlertCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePaymentStatusUpdate = (orderId: number, paymentStatus: string) => {
    updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
  };

  // Function to check if a status option should be disabled
  const isStatusDisabled = (currentStatus: string, optionStatus: string) => {
    const statusHierarchy = ["pending_prescription_review", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusHierarchy.indexOf(currentStatus);
    const optionIndex = statusHierarchy.indexOf(optionStatus);
    
    // Allow cancelled from any status except delivered
    if (optionStatus === "cancelled") {
      return currentStatus === "delivered";
    }
    
    // Prevent downgrading to lower status (except cancelled)
    if (currentIndex >= 0 && optionIndex >= 0) {
      return optionIndex < currentIndex;
    }
    
    return false;
  };

  // Smart filtering logic based on order lifecycle
  const categorizeOrders = () => {
    const activeStatuses = ["pending_prescription_review", "confirmed", "processing", "shipped"];
    const completedStatuses = ["delivered"];
    const cancelledStatuses = ["cancelled"];

    return {
      active: orders.filter((order: any) => activeStatuses.includes(order.status)),
      completed: orders.filter((order: any) => completedStatuses.includes(order.status)),
      cancelled: orders.filter((order: any) => cancelledStatuses.includes(order.status)),
      all: orders
    };
  };

  const categorizedOrders = categorizeOrders();

  const getOrdersForTab = (tab: string) => {
    const ordersForTab = categorizedOrders[tab as keyof typeof categorizedOrders] || [];
    return ordersForTab.filter((order: any) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const statusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Helper function to render order table
  const renderOrderTable = (orders: any[], isReadOnly = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order: any) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {order.orderNumber}
                {order.prescription && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <FileText className="h-3 w-3 mr-1" />
                    RX
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
              </div>
            </TableCell>
            <TableCell>
              {order.items?.length || 0} item(s)
            </TableCell>
            <TableCell>
              ₹{parseFloat(order.totalAmount).toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                {getStatusIcon(order.status)}
                {order.status.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(order.placedAt).toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Order Details - {order.orderNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-sm">Customer</Label>
                          <p className="font-medium text-sm sm:text-base">{order.user.firstName} {order.user.lastName}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.user.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Current Status</Label>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit mt-1 text-xs`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {!isReadOnly && (
                        <div>
                          <Label className="text-sm">Update Status</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {statusOptions.map((status) => (
                              <Button
                                key={status.value}
                                variant={order.status === status.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, status.value)}
                                disabled={updateOrderStatusMutation.isPending || isStatusDisabled(order.status, status.value)}
                                className={`text-xs ${isStatusDisabled(order.status, status.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {status.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Status Management - Only show when order is delivered */}
                      {!isReadOnly && order.status === 'delivered' && (
                        <div className="border-t pt-4">
                          <Label className="text-sm">Payment Status Management</Label>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-blue-800 text-sm">Current Payment Status</p>
                                <Badge 
                                  variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                                  className={`text-xs mt-1 ${
                                    order.paymentStatus === "paid" 
                                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                      : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                  }`}
                                >
                                  {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                                </Badge>
                              </div>
                              <div className="text-sm text-blue-600 font-medium">
                                ₹{order.totalAmount}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm text-blue-700 mb-2">
                                Update payment status after delivery confirmation:
                                {order.paymentStatus === "pending" && (
                                  <span className="block text-xs text-orange-600 mt-1">
                                    Note: Once marked as "Paid", this status cannot be reversed.
                                  </span>
                                )}
                              </p>
                              {order.paymentStatus === "paid" && (
                                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-2">
                                  ✓ Payment confirmed and locked. This status cannot be changed for security reasons.
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  variant={order.paymentStatus === "paid" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePaymentStatusUpdate(order.id, "paid")}
                                  disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "paid"}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                >
                                  Mark as Paid
                                </Button>
                                <Button
                                  variant={order.paymentStatus === "pending" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePaymentStatusUpdate(order.id, "pending")}
                                  disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "pending" || order.paymentStatus === "paid"}
                                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs disabled:bg-gray-400 disabled:hover:bg-gray-400"
                                >
                                  Mark as Pending
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {order.prescription && (
                        <div>
                          <Label className="text-sm">Prescription Details</Label>
                          <div className="border rounded-lg p-2 sm:p-3 mt-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                <div>
                                  <p className="font-medium text-xs sm:text-sm truncate">{order.prescription.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded: {new Date(order.prescription.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${
                                  order.prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.prescription.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.prescription.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/uploads/prescriptions/${order.prescription.fileName}`, '_blank')}
                                  className="text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                            {order.prescription.reviewNotes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-700">Review Notes:</p>
                                <p className="text-xs text-gray-600">{order.prescription.reviewNotes}</p>
                              </div>
                            )}
                            {order.prescription.reviewedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Reviewed: {new Date(order.prescription.reviewedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm">Order Items ({order.items?.length || 0})</Label>
                        <div className="border rounded-lg mt-2">
                          {/* Scrollable items container */}
                          <div className="max-h-48 overflow-y-auto p-2 sm:p-3">
                            {order.items?.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm truncate">{item.medicine?.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-xs sm:text-sm">₹{parseFloat(item.unitPrice).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          {/* Total outside scroll area */}
                          <div className="flex justify-between items-center p-2 sm:p-3 border-t font-semibold bg-gray-50">
                            <span className="text-sm">Total Amount</span>
                            <span className="text-sm sm:text-base">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {!isReadOnly && order.status === "pending_prescription_review" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "confirmed")}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                
                {!isReadOnly && order.status === "confirmed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(order.id, "processing")}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    Process
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage customer orders with smart filtering and lifecycle tracking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold">{orders.length} Total Orders</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Smart Order Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Active Orders</span>
            <span className="sm:hidden">Active</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {categorizedOrders.active.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1 sm:gap-2">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {categorizedOrders.completed.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-1 sm:gap-2">
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Cancelled</span>
            <span className="sm:hidden">Cancel</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {categorizedOrders.cancelled.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2">
            <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All Orders</span>
            <span className="sm:hidden">All</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {categorizedOrders.all.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Active Orders Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Active Orders ({getOrdersForTab("active").length})
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Orders requiring attention: pending review, confirmed, processing, or shipped
              </p>
            </CardHeader>
            <CardContent>
              {getOrdersForTab("active").length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
                  <p className="text-muted-foreground">
                    All orders are either completed or cancelled.
                  </p>
                </div>
              ) : (
                renderOrderTable(getOrdersForTab("active"))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Orders Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed Orders ({getOrdersForTab("completed").length})
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Successfully delivered orders with payment management
              </p>
            </CardHeader>
            <CardContent>
              {getOrdersForTab("completed").length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                  <p className="text-muted-foreground">
                    No orders have been completed yet.
                  </p>
                </div>
              ) : (
                renderOrderTable(getOrdersForTab("completed"), false)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cancelled Orders Tab */}
        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Cancelled Orders ({getOrdersForTab("cancelled").length})
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Orders that were cancelled (read-only)
              </p>
            </CardHeader>
            <CardContent>
              {getOrdersForTab("cancelled").length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cancelled Orders</h3>
                  <p className="text-muted-foreground">
                    No orders have been cancelled.
                  </p>
                </div>
              ) : (
                renderOrderTable(getOrdersForTab("cancelled"), true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Orders Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-gray-600" />
                All Orders ({getOrdersForTab("all").length})
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Complete order history and archive
              </p>
            </CardHeader>
            <CardContent>
              {getOrdersForTab("all").length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders</h3>
                  <p className="text-muted-foreground">
                    No orders have been placed yet.
                  </p>
                </div>
              ) : (
                renderOrderTable(getOrdersForTab("all"))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}