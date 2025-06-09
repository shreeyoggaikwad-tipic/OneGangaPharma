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
  const filteredOrders = orders.filter((order: any) => {
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
            <div className="overflow-x-auto">
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
                          <div className="font-medium">#{order.orderNumber}</div>
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
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Progress */}
                                <div>
                                  <h4 className="font-semibold mb-3">Order Status</h4>
                                  <OrderProgress status={selectedOrder.status} />
                                </div>

                                {/* Customer Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Customer Information
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                                      <p className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {selectedOrder.user?.email}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        {selectedOrder.user?.phone}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Delivery Address
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                      <div className="space-y-1">
                                        <p>{selectedOrder.shippingAddress?.fullName}</p>
                                        <p>{selectedOrder.shippingAddress?.phone}</p>
                                        <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                                        {selectedOrder.shippingAddress?.addressLine2 && (
                                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                                        )}
                                        <p>
                                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Items */}
                                <div>
                                  <h4 className="font-semibold mb-3">Order Items</h4>
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
                                              {item.medicine?.dosage} | {item.medicine?.manufacturer}
                                            </p>
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

                                {/* Prescription */}
                                {selectedOrder.prescription && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Prescription
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                      <div className="space-y-2">
                                        <p><strong>File:</strong> {selectedOrder.prescription.fileName}</p>
                                        <p><strong>Status:</strong> 
                                          <Badge className="ml-2 bg-green-100 text-green-800">
                                            {selectedOrder.prescription.status}
                                          </Badge>
                                        </p>
                                        <p><strong>Uploaded:</strong> {new Date(selectedOrder.prescription.uploadedAt).toLocaleDateString()}</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Total */}
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
