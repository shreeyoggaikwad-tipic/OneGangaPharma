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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">
          Track and manage customer orders
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by order number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
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
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
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
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.placedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderStatus(order.id, status)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{formatStatus(order.status)}</span>
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem 
                              value="placed" 
                              disabled={isStatusDisabled(order.status, "placed")}
                              className={isStatusDisabled(order.status, "placed") ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              Placed
                            </SelectItem>
                            <SelectItem 
                              value="confirmed" 
                              disabled={isStatusDisabled(order.status, "confirmed")}
                              className={isStatusDisabled(order.status, "confirmed") ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              Confirmed
                            </SelectItem>
                            <SelectItem 
                              value="out_for_delivery" 
                              disabled={isStatusDisabled(order.status, "out_for_delivery")}
                              className={isStatusDisabled(order.status, "out_for_delivery") ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              Out for Delivery
                            </SelectItem>
                            <SelectItem 
                              value="delivered" 
                              disabled={isStatusDisabled(order.status, "delivered")}
                              className={isStatusDisabled(order.status, "delivered") ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              Delivered
                            </SelectItem>
                            <SelectItem 
                              value="cancelled" 
                              disabled={isStatusDisabled(order.status, "cancelled")}
                              className={isStatusDisabled(order.status, "cancelled") ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              Cancelled
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
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
                          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
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
                                        disabled={statusMutation.isPending}
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

                                {/* Order Items - MAIN SCROLLABLE SECTION */}
                                <div>
                                  <h3 className="font-semibold mb-3">
                                    Order Items ({selectedOrder.items?.length || 0})
                                  </h3>
                                  
                                  {/* THIS IS THE KEY FIX - Dedicated scrollable container */}
                                  <div 
                                    className="border rounded-lg bg-white" 
                                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                                  >
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                      selectedOrder.items.map((item: any, index: number) => (
                                        <div 
                                          key={item.id || index} 
                                          className={`p-3 flex items-center justify-between ${
                                            index !== selectedOrder.items.length - 1 ? 'border-b' : ''
                                          }`}
                                        >
                                          <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                              {item.medicine?.frontImageUrl ? (
                                                <img
                                                  src={item.medicine.frontImageUrl}
                                                  alt={item.medicine.name}
                                                  className="w-full h-full object-cover rounded-lg"
                                                />
                                              ) : (
                                                <Package className="h-5 w-5 text-blue-600" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm">{item.medicine?.name || 'Unknown Medicine'}</p>
                                              <p className="text-xs text-gray-500">
                                                Qty: {item.quantity} | ₹{item.unitPrice} each
                                              </p>
                                              {item.medicine?.requiresPrescription && (
                                                <Badge variant="destructive" className="text-xs mt-1">
                                                  Schedule H
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right ml-2">
                                            <p className="font-semibold text-sm">₹{item.totalPrice}</p>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-4 text-center text-gray-500">
                                        No items found in this order
                                      </div>
                                    )}
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
