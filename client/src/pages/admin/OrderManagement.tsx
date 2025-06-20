import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  User,
  MapPin,
  FileText,
  Phone,
  Mail,
  Download,
} from "lucide-react";

export default function OrderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Get orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const ordersArray = Array.isArray(orders) ? orders : [];

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: number; paymentStatus: string }) =>
      apiRequest("PUT", `/api/admin/orders/${orderId}/payment-status`, { paymentStatus }),
    onSuccess: () => {
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-analytics"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle status update
  const handleStatusUpdate = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = (orderId: number, paymentStatus: string) => {
    updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
  };

  // Filter orders
  const filteredOrders = ordersArray.filter((order: any) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  const updateOrderStatus = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Function to check if a status option should be disabled
  const isStatusDisabled = (currentStatus: string, optionStatus: string) => {
    const statusHierarchy = ["placed", "confirmed", "out_for_delivery", "delivered"];
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

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Track and manage customer orders
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 lg:w-52">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Order</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="sm:table-row block border-b sm:border-b-0 mb-4 sm:mb-0">
                      {/* Mobile Card Layout */}
                      <TableCell className="sm:table-cell block w-full sm:w-auto p-3 sm:p-4">
                        <div className="sm:hidden space-y-3 bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium flex items-center gap-2 text-sm">
                                #{order.orderNumber}
                                {order.prescription && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    <FileText className="h-3 w-3 mr-1" />
                                    RX
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {order.items?.length || 0} item(s)
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="font-medium text-sm">
                              {order.user?.firstName} {order.user?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {order.user?.email}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-sm">₹{order.totalAmount}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(order.placedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              {/* Dialog content remains the same */}
                              <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                                </DialogHeader>
                                
                                {selectedOrder && (
                                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                                    {/* Customer & Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="font-semibold mb-2">Customer</h3>
                                        <p className="text-sm">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.user?.email}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold mb-2">Current Status</h3>
                                        <Badge className="capitalize">{selectedOrder.status}</Badge>
                                      </div>
                                    </div>

                                    {/* Status Update Buttons */}
                                    <div>
                                      <h3 className="font-semibold mb-3">Update Status</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                          <Button
                                            key={status}
                                            variant={selectedOrder.status === status ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                            disabled={updateStatusMutation.isPending}
                                            className="capitalize"
                                          >
                                            {status}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Prescription if exists */}
                                    {selectedOrder.prescription && (
                                      <div>
                                        <h3 className="font-semibold mb-3">Prescription Details</h3>
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium">
                                                {selectedOrder.prescription.fileName}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Uploaded: {new Date(selectedOrder.prescription.uploadedAt).toLocaleDateString()}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Reviewed: {new Date(selectedOrder.prescription.reviewedAt).toLocaleDateString()}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant={selectedOrder.prescription.status === 'approved' ? 'default' : 'secondary'}>
                                                {selectedOrder.prescription.status}
                                              </Badge>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`/uploads/prescriptions/${selectedOrder.prescription.fileName}`, '_blank')}
                                              >
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Order Items - SCROLLABLE SECTION */}
                                    <div className="border-t pt-4">
                                      <h3 className="font-semibold mb-3">Order Items</h3>
                                      
                                      {/* Compact scrollable list */}
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                          {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item: any, index: number) => (
                                              <div key={item.id || index} className="bg-white rounded p-2 text-sm">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <p className="font-medium">{item.medicine?.name || 'Medicine'}</p>
                                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                  </div>
                                                  <p className="font-semibold">₹{item.totalPrice}</p>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-center text-gray-500">No items</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="border-t pt-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Total Amount</span>
                                        <span className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Payment Method: Cash on Delivery
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        
                        {/* Desktop Table Layout */}
                        <div className="hidden sm:block">
                          <div className="font-medium flex items-center gap-2">
                            #{order.orderNumber}
                            {order.prescription && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <FileText className="h-3 w-3 mr-1" />
                                RX
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item(s)
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <div className="font-medium">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(order.placedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-medium">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                                {/* Customer & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">Customer</h3>
                                    <p className="text-sm">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.user?.email}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2">Current Status</h3>
                                    <Badge className="capitalize">{selectedOrder.status}</Badge>
                                  </div>
                                </div>

                                {/* Status Update Buttons */}
                                <div>
                                  <h3 className="font-semibold mb-3">Update Status</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                      <Button
                                        key={status}
                                        variant={selectedOrder.status === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                        disabled={updateStatusMutation.isPending}
                                        className="capitalize"
                                      >
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                {/* Payment Status Management - Only show when order is delivered */}
                                {selectedOrder.status === 'delivered' && (
                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Payment Status Management</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div>
                                          <p className="font-medium text-blue-800">Current Payment Status</p>
                                          <Badge 
                                            variant={selectedOrder.paymentStatus === "paid" ? "default" : "secondary"}
                                            className={
                                              selectedOrder.paymentStatus === "paid" 
                                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                                : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                            }
                                          >
                                            {selectedOrder.paymentStatus === "paid" ? "Paid" : "Pending"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-blue-600">
                                          ₹{selectedOrder.totalAmount}
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <p className="text-sm text-blue-700 mb-3">
                                          Update payment status after order delivery confirmation:
                                        </p>
                                        <div className="flex gap-2">
                                          <Button
                                            variant={selectedOrder.paymentStatus === "paid" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePaymentStatusUpdate(selectedOrder.id, "paid")}
                                            disabled={updatePaymentStatusMutation.isPending || selectedOrder.paymentStatus === "paid"}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            Mark as Paid
                                          </Button>
                                          <Button
                                            variant={selectedOrder.paymentStatus === "pending" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePaymentStatusUpdate(selectedOrder.id, "pending")}
                                            disabled={updatePaymentStatusMutation.isPending || selectedOrder.paymentStatus === "pending"}
                                            className="bg-orange-600 hover:bg-orange-700 text-white"
                                          >
                                            Mark as Pending
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Prescription if exists */}
                                {selectedOrder.prescription && (
                                  <div>
                                    <h3 className="font-semibold mb-3">Prescription Details</h3>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">
                                            {selectedOrder.prescription.fileName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Uploaded: {new Date(selectedOrder.prescription.uploadedAt).toLocaleDateString()}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Reviewed: {new Date(selectedOrder.prescription.reviewedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant={selectedOrder.prescription.status === 'approved' ? 'default' : 'secondary'}>
                                            {selectedOrder.prescription.status}
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(`/uploads/prescriptions/${selectedOrder.prescription.fileName}`, '_blank')}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Order Items - SCROLLABLE SECTION */}
                                <div className="border-t pt-4">
                                  <h3 className="font-semibold mb-3">Order Items</h3>
                                  
                                  {/* Compact scrollable list */}
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item: any, index: number) => (
                                          <div key={item.id || index} className="bg-white rounded p-2 text-sm">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <p className="font-medium">{item.medicine?.name || 'Medicine'}</p>
                                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                              </div>
                                              <p className="font-semibold">₹{item.totalPrice}</p>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-center text-gray-500">No items</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Total Amount */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Payment Method: Cash on Delivery
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
