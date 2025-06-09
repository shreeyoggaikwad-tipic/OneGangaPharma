import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Eye,
  Check,
  X,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Get all orders
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setShowOrderDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
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

  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage customer orders and update their status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">{orders.length} Orders</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by order number or customer email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending_prescription_review">Pending Review</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all" 
                  ? "No orders have been placed yet." 
                  : `No orders with "${statusFilter}" status found.`}
              </p>
            </div>
          ) : (
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
                {filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
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
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer</Label>
                                  <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                                </div>
                                <div>
                                  <Label>Current Status</Label>
                                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit mt-1`}>
                                    {getStatusIcon(order.status)}
                                    {order.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Update Status</Label>
                                <div className="flex gap-2 mt-2">
                                  {statusOptions.map((status) => (
                                    <Button
                                      key={status.value}
                                      variant={order.status === status.value ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, status.value)}
                                      disabled={updateOrderStatusMutation.isPending}
                                    >
                                      {status.label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label>Order Items</Label>
                                <div className="border rounded-lg p-3 mt-2">
                                  {order.items?.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                      <div>
                                        <p className="font-medium">{item.medicine?.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="font-medium">₹{parseFloat(item.unitPrice).toLocaleString()}</p>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold">
                                    <span>Total Amount</span>
                                    <span>₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {order.status === "pending_prescription_review" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "confirmed")}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {order.status === "confirmed" && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}