// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Package,
//   Eye,
//   Check,
//   Clock,
//   Truck,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Search,
//   Activity,
//   Archive,
//   RefreshCw,
//   FileText,
// } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";

// export default function AdminOrders() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
  
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<string>("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [prescriptionReviewData, setPrescriptionReviewData] = useState<{
//     prescriptionId: number | null;
//     status: 'approved' | 'rejected' | null;
//     reviewNotes: string;
//   }>({
//     prescriptionId: null,
//     status: null,
//     reviewNotes: ''
//   });

//   // Get all orders - force fresh data on every load
//   // const { data: orders = [], isLoading } = useQuery<any[]>({
//   //   queryKey: ["/api/admin/orders"],
//   //   staleTime: 0, // Always refetch
//   //   gcTime: 0, // Don't cache (renamed from cacheTime in v5)
//   // });
//   // Example: get storeId dynamically (from session, context, or props)
// const { user } = useAuth(); // assuming you store logged-in user with storeId
// const storeId = user?.storeId; // adjust this to your app

// const { data: orders = [], isLoading } = useQuery<any[]>({
//   queryKey: ["/api/admin/orders", storeId],
//   queryFn: async () => {
//     if (!storeId) return [];
//     const res = await fetch(`/api/admin/orders?storeId=${storeId}`);
//     if (!res.ok) throw new Error("Failed to fetch orders");
//     return res.json();
//   },
//   enabled: !!storeId,  // only run when storeId exists
//   staleTime: 0,        // Always refetch
//   gcTime: 0,           // Don’t cache
// });


//   // Update order status mutation
//   const updateOrderStatusMutation = useMutation({
//     mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
//       apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status }),
//     onSuccess: (updatedOrder: any) => {
//       toast({
//         title: "Order Updated",
//         description: "Order status has been updated successfully.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       // Update selectedOrder state immediately to show payment UI
//       if (selectedOrder && selectedOrder.id === updatedOrder.id) {
//         setSelectedOrder({ ...selectedOrder, status: updatedOrder.status });
//       }
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Update Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Update payment status mutation
//   const updatePaymentStatusMutation = useMutation({
//     mutationFn: ({ orderId, paymentStatus }: { orderId: number; paymentStatus: string }) =>
//       apiRequest("PUT", `/api/admin/orders/${orderId}/payment-status`, { paymentStatus }),
//     onSuccess: (updatedOrder: any) => {
//       toast({
//         title: "Payment Status Updated",
//         description: "Payment status has been updated successfully.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-analytics"] });
//       // Update selectedOrder state with new payment status
//       if (selectedOrder && selectedOrder.id === updatedOrder.id) {
//         setSelectedOrder({ ...selectedOrder, paymentStatus: updatedOrder.paymentStatus });
//       }
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Prescription approval mutation
//   const prescriptionApprovalMutation = useMutation({
//     mutationFn: async ({ prescriptionId, status, reviewNotes }: { prescriptionId: number; status: 'approved' | 'rejected'; reviewNotes: string }) => {
//       return apiRequest("PUT", `/api/admin/prescriptions/${prescriptionId}`, { status, reviewNotes });
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Prescription review completed successfully",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/prescriptions"] });
//       // Reset prescription review form
//       setPrescriptionReviewData({
//         prescriptionId: null,
//         status: null,
//         reviewNotes: ''
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const handlePrescriptionApproval = (prescriptionId: number, status: 'approved' | 'rejected') => {
//     // Only require reason for rejection
//     if (status === 'rejected' && !prescriptionReviewData.reviewNotes.trim()) {
//       toast({
//         title: "Reason Required for Rejection",
//         description: "Please provide a reason for rejecting this prescription",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     prescriptionApprovalMutation.mutate({
//       prescriptionId,
//       status,
//       reviewNotes: prescriptionReviewData.reviewNotes.trim() || ''
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "confirmed":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "pending_prescription_review":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "processing":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "shipped":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "delivered":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "cancelled":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "confirmed":
//         return <CheckCircle className="h-4 w-4" />;
//       case "pending_prescription_review":
//         return <AlertCircle className="h-4 w-4" />;
//       case "processing":
//         return <Clock className="h-4 w-4" />;
//       case "shipped":
//         return <Truck className="h-4 w-4" />;
//       case "delivered":
//         return <Package className="h-4 w-4" />;
//       case "cancelled":
//         return <XCircle className="h-4 w-4" />;
//       default:
//         return <Clock className="h-4 w-4" />;
//     }
//   };

//   const handleStatusUpdate = (orderId: number, newStatus: string) => {
//     updateOrderStatusMutation.mutate({ orderId, status: newStatus });
//   };

//   const handlePaymentStatusUpdate = (orderId: number, paymentStatus: string) => {
//     updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
//   };

//   // Function to check if a status option should be disabled
//   const isStatusDisabled = (currentStatus: string, optionStatus: string) => {
//     const statusHierarchy = ["pending_prescription_review", "confirmed", "processing", "shipped", "delivered"];
//     const currentIndex = statusHierarchy.indexOf(currentStatus);
//     const optionIndex = statusHierarchy.indexOf(optionStatus);
    
//     // Allow cancelled from any status except delivered
//     if (optionStatus === "cancelled") {
//       return currentStatus === "delivered";
//     }
    
//     // Prevent downgrading to lower status (except cancelled)
//     if (currentIndex >= 0 && optionIndex >= 0) {
//       return optionIndex < currentIndex;
//     }
    
//     return false;
//   };

//   // Smart filtering logic based on order lifecycle
//   const categorizeOrders = () => {
//     const activeStatuses = ["pending_prescription_review", "confirmed", "processing", "shipped"];
//     const completedStatuses = ["delivered"];
//     const cancelledStatuses = ["cancelled"];

//     return {
//       active: orders.filter((order: any) => activeStatuses.includes(order.status)),
//       completed: orders.filter((order: any) => completedStatuses.includes(order.status)),
//       cancelled: orders.filter((order: any) => cancelledStatuses.includes(order.status)),
//       all: orders
//     };
//   };

//   const categorizedOrders = categorizeOrders();

//   const getOrdersForTab = (tab: string) => {
//     const ordersForTab = categorizedOrders[tab as keyof typeof categorizedOrders] || [];
//     return ordersForTab.filter((order: any) => {
//       const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesSearch;
//     });
//   };

//   const statusOptions = [
//     { value: "confirmed", label: "Confirmed" },
//     { value: "processing", label: "Processing" },
//     { value: "shipped", label: "Shipped" },
//     { value: "delivered", label: "Delivered" },
//     { value: "cancelled", label: "Cancelled" },
//   ];

//   // Helper function to render order table
//   const renderOrderTable = (orders: any[], isReadOnly = false) => (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Order Number</TableHead>
//           <TableHead>Customer</TableHead>
//           <TableHead>Items</TableHead>
//           <TableHead>Total</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Date</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {orders.map((order: any) => (
//           <TableRow key={order.id}>
//             <TableCell className="font-medium">
//               <div className="flex items-center gap-2">
//                 {order.orderNumber}
//                 {order.prescription && (
//                   <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
//                     <FileText className="h-3 w-3 mr-1" />
//                     RX
//                   </Badge>
//                 )}
//               </div>
//             </TableCell>
//             <TableCell>
//               <div>
//                 <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
//                 <p className="text-sm text-muted-foreground">{order.user.email}</p>
//               </div>
//             </TableCell>
//             <TableCell>
//               {order.items?.length || 0} item(s)
//             </TableCell>
//             <TableCell>
//               ₹{parseFloat(order.totalAmount).toLocaleString()}
//             </TableCell>
//             <TableCell>
//               <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
//                 {getStatusIcon(order.status)}
//                 {order.status.replace('_', ' ')}
//               </Badge>
//             </TableCell>
//             <TableCell>
//               {new Date(order.placedAt).toLocaleDateString("en-IN")}
//             </TableCell>
//             <TableCell>
//               <div className="flex items-center gap-2">
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => setSelectedOrder(order)}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden">
//                     <DialogHeader>
//                       <DialogTitle className="text-base sm:text-lg">Order Details - {order.orderNumber}</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                         <div>
//                           <Label className="text-sm">Customer</Label>
//                           <p className="font-medium text-sm sm:text-base">{order.user.firstName} {order.user.lastName}</p>
//                           <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.user.email}</p>
//                         </div>
//                         <div>
//                           <Label className="text-sm">Current Status</Label>
//                           <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit mt-1 text-xs`}>
//                             {getStatusIcon(order.status)}
//                             {order.status.replace('_', ' ')}
//                           </Badge>
//                         </div>
//                       </div>
                      
//                       {!isReadOnly && (
//                         <div>
//                           <Label className="text-sm">Update Status</Label>
//                           <div className="flex flex-wrap gap-2 mt-2">
//                             {statusOptions.map((status) => (
//                               <Button
//                                 key={status.value}
//                                 variant={order.status === status.value ? "default" : "outline"}
//                                 size="sm"
//                                 onClick={() => handleStatusUpdate(order.id, status.value)}
//                                 disabled={updateOrderStatusMutation.isPending || isStatusDisabled(order.status, status.value)}
//                                 className={`text-xs ${isStatusDisabled(order.status, status.value) ? "opacity-50 cursor-not-allowed" : ""}`}
//                               >
//                                 {status.label}
//                               </Button>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Payment Status Management - Only show when order is delivered */}
//                       {!isReadOnly && order.status === 'delivered' && (
//                         <div className="border-t pt-4">
//                           <Label className="text-sm">Payment Status Management</Label>
//                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
//                             <div className="flex items-center justify-between mb-3">
//                               <div>
//                                 <p className="font-medium text-blue-800 text-sm">Current Payment Status</p>
//                                 <Badge 
//                                   variant={order.paymentStatus === "paid" ? "default" : "secondary"}
//                                   className={`text-xs mt-1 ${
//                                     order.paymentStatus === "paid" 
//                                       ? "bg-green-100 text-green-800 hover:bg-green-100" 
//                                       : "bg-orange-100 text-orange-800 hover:bg-orange-100"
//                                   }`}
//                                 >
//                                   {order.paymentStatus === "paid" ? "Paid" : "Pending"}
//                                 </Badge>
//                               </div>
//                               <div className="text-sm text-blue-600 font-medium">
//                                 ₹{order.totalAmount}
//                               </div>
//                             </div>
                            
//                             <div className="space-y-2">
//                               <p className="text-sm text-blue-700 mb-2">
//                                 Update payment status after delivery confirmation:
//                                 {order.paymentStatus === "pending" && (
//                                   <span className="block text-xs text-orange-600 mt-1">
//                                     Note: Once marked as "Paid", this status cannot be reversed.
//                                   </span>
//                                 )}
//                               </p>
//                               {order.paymentStatus === "paid" && (
//                                 <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-2">
//                                   ✓ Payment confirmed and locked. This status cannot be changed for security reasons.
//                                 </p>
//                               )}
//                               <div className="flex gap-2">
//                                 <Button
//                                   variant={order.paymentStatus === "paid" ? "default" : "outline"}
//                                   size="sm"
//                                   onClick={() => handlePaymentStatusUpdate(order.id, "paid")}
//                                   disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "paid"}
//                                   className="bg-green-600 hover:bg-green-700 text-white text-xs"
//                                 >
//                                   Mark as Paid
//                                 </Button>
//                                 <Button
//                                   variant={order.paymentStatus === "pending" ? "default" : "outline"}
//                                   size="sm"
//                                   onClick={() => handlePaymentStatusUpdate(order.id, "pending")}
//                                   disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "pending" || order.paymentStatus === "paid"}
//                                   className="bg-orange-600 hover:bg-orange-700 text-white text-xs disabled:bg-gray-400 disabled:hover:bg-gray-400"
//                                 >
//                                   Mark as Pending
//                                 </Button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
                      
//                       {order.prescription && (
//                         <div>
//                           <Label className="text-sm">Prescription Details</Label>
//                           <div className="border rounded-lg p-2 sm:p-3 mt-2">
//                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                               <div className="flex items-center gap-2">
//                                 <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
//                                 <div>
//                                   <p className="font-medium text-xs sm:text-sm truncate">{order.prescription.fileName}</p>
//                                   <p className="text-xs text-muted-foreground">
//                                     Uploaded: {new Date(order.prescription.uploadedAt).toLocaleDateString()}
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Badge className={`text-xs ${
//                                   order.prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
//                                   order.prescription.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                                   'bg-yellow-100 text-yellow-800'
//                                 }`}>
//                                   {order.prescription.status}
//                                 </Badge>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   onClick={() => window.open(`/uploads/prescriptions/${order.prescription.fileName}`, '_blank')}
//                                   className="text-xs"
//                                 >
//                                   <FileText className="h-3 w-3 mr-1" />
//                                   View
//                                 </Button>
//                               </div>
//                             </div>
//                             {order.prescription.reviewNotes && (
//                               <div className="mt-2 p-2 bg-gray-50 rounded-lg">
//                                 <p className="text-xs font-medium text-gray-700">Review Notes:</p>
//                                 <p className="text-xs text-gray-600">{order.prescription.reviewNotes}</p>
//                               </div>
//                             )}
//                             {order.prescription.reviewedAt && (
//                               <p className="text-xs text-muted-foreground mt-1">
//                                 Reviewed: {new Date(order.prescription.reviewedAt).toLocaleDateString()}
//                               </p>
//                             )}
                            
//                             {/* Prescription Approval Section - Only show for pending prescriptions */}
//                             {order.prescription.status === 'pending' && (
//                               <div className="mt-3 p-3 border-t bg-blue-50 rounded-b-lg">
//                                 <Label className="text-sm font-medium text-blue-800 mb-2 block">
//                                   Prescription Review
//                                 </Label>
//                                 <div className="space-y-3">
//                                   <div>
//                                     <Label className="text-xs text-gray-700 mb-1 block">
//                                       Review Notes (Required for rejection)
//                                     </Label>
//                                     <Textarea
//                                       placeholder="Provide reason for approval/rejection..."
//                                       value={prescriptionReviewData.prescriptionId === order.prescription.id ? prescriptionReviewData.reviewNotes : ''}
//                                       onChange={(e) => setPrescriptionReviewData({
//                                         prescriptionId: order.prescription.id,
//                                         status: null,
//                                         reviewNotes: e.target.value
//                                       })}
//                                       className="text-xs resize-none"
//                                       rows={2}
//                                     />
//                                   </div>
//                                   <div className="flex gap-2">
//                                     <Button
//                                       size="sm"
//                                       onClick={() => handlePrescriptionApproval(order.prescription.id, 'approved')}
//                                       disabled={prescriptionApprovalMutation.isPending}
//                                       className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
//                                     >
//                                       <Check className="h-3 w-3 mr-1" />
//                                       Approve
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       onClick={() => handlePrescriptionApproval(order.prescription.id, 'rejected')}
//                                       disabled={prescriptionApprovalMutation.isPending}
//                                       className="text-xs flex-1"
//                                     >
//                                       <XCircle className="h-3 w-3 mr-1" />
//                                       Reject
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
                      
//                       <div>
//                         <Label className="text-sm">Order Items ({order.items?.length || 0})</Label>
//                         <div className="border rounded-lg mt-2">
//                           {/* Scrollable items container */}
//                           <div className="max-h-48 overflow-y-auto p-2 sm:p-3">
//                             {order.items?.map((item: any, index: number) => (
//                               <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="font-medium text-xs sm:text-sm truncate">{item.medicine?.name}</p>
//                                   <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
//                                 </div>
//                                 <p className="font-medium text-xs sm:text-sm">₹{parseFloat(item.unitPrice).toLocaleString()}</p>
//                               </div>
//                             ))}
//                           </div>
//                           {/* Total outside scroll area */}
//                           <div className="flex justify-between items-center p-2 sm:p-3 border-t font-semibold bg-gray-50">
//                             <span className="text-sm">Total Amount</span>
//                             <span className="text-sm sm:text-base">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
                
//                 {!isReadOnly && order.status === "pending_prescription_review" && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleStatusUpdate(order.id, "confirmed")}
//                     disabled={updateOrderStatusMutation.isPending}
//                   >
//                     <Check className="h-4 w-4 mr-1" />
//                     Approve
//                   </Button>
//                 )}
                
//                 {!isReadOnly && order.status === "confirmed" && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleStatusUpdate(order.id, "processing")}
//                     disabled={updateOrderStatusMutation.isPending}
//                   >
//                     Process
//                   </Button>
//                 )}
//               </div>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-6">
//         <div className="space-y-4">
//           {[...Array(5)].map((_, i) => (
//             <Card key={i} className="animate-pulse">
//               <CardContent className="p-6">
//                 <div className="h-16 bg-gray-200 rounded"></div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
//           <p className="text-sm sm:text-base text-muted-foreground">
//             Manage customer orders with smart filtering and lifecycle tracking
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
//           <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}>
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//           <div className="flex items-center gap-2">
//             <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
//             <span className="text-base sm:text-lg font-semibold">{orders.length} Total Orders</span>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <Card className="mb-4 sm:mb-6">
//         <CardContent className="p-3 sm:p-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search orders..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 text-sm sm:text-base"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Smart Order Management Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
//         <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
//           <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2">
//             <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Active Orders</span>
//             <span className="sm:hidden">Active</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.active.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="completed" className="flex items-center gap-1 sm:gap-2">
//             <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Completed</span>
//             <span className="sm:hidden">Done</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.completed.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="cancelled" className="flex items-center gap-1 sm:gap-2">
//             <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Cancelled</span>
//             <span className="sm:hidden">Cancel</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.cancelled.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2">
//             <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">All Orders</span>
//             <span className="sm:hidden">All</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.all.length}
//             </Badge>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Orders Tab */}
//         <TabsContent value="active">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Activity className="h-5 w-5 text-blue-600" />
//                 Active Orders ({getOrdersForTab("active").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Orders requiring attention: pending review, confirmed, processing, or shipped
//               </p>
//             </CardHeader>
//             <CardContent>
//               {getOrdersForTab("active").length === 0 ? (
//                 <div className="text-center py-12">
//                   <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
//                   <p className="text-muted-foreground">
//                     All orders are either completed or cancelled.
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("active"))
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Completed Orders Tab */}
//         <TabsContent value="completed">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//                 Completed Orders ({getOrdersForTab("completed").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Successfully delivered orders with payment management
//               </p>
//             </CardHeader>
//             <CardContent>
//               {getOrdersForTab("completed").length === 0 ? (
//                 <div className="text-center py-12">
//                   <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
//                   <p className="text-muted-foreground">
//                     No orders have been completed yet.
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("completed"), false)
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Cancelled Orders Tab */}
//         <TabsContent value="cancelled">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <XCircle className="h-5 w-5 text-red-600" />
//                 Cancelled Orders ({getOrdersForTab("cancelled").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Orders that were cancelled (read-only)
//               </p>
//             </CardHeader>
//             <CardContent>
//               {getOrdersForTab("cancelled").length === 0 ? (
//                 <div className="text-center py-12">
//                   <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Cancelled Orders</h3>
//                   <p className="text-muted-foreground">
//                     No orders have been cancelled.
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("cancelled"), true)
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* All Orders Tab */}
//         <TabsContent value="all">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Archive className="h-5 w-5 text-gray-600" />
//                 All Orders ({getOrdersForTab("all").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Complete order history and archive
//               </p>
//             </CardHeader>
//             <CardContent>
//               {getOrdersForTab("all").length === 0 ? (
//                 <div className="text-center py-12">
//                   <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Orders</h3>
//                   <p className="text-muted-foreground">
//                     No orders have been placed yet.
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("all"))
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Package,
//   Eye,
//   Check,
//   Clock,
//   Truck,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Search,
//   Activity,
//   Archive,
//   RefreshCw,
//   FileText,
// } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";

// interface OrderManagementProps {
//   userRole?: string; // "admin" | "supervisor"
// }

// export default function AdminOrders({ userRole = "admin" }: OrderManagementProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { user } = useAuth();
  
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<string>("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [prescriptionReviewData, setPrescriptionReviewData] = useState<{
//     prescriptionId: number | null;
//     status: 'approved' | 'rejected' | null;
//     reviewNotes: string;
//   }>({
//     prescriptionId: null,
//     status: null,
//     reviewNotes: ''
//   });

//   // Determine store context based on role
//   const getStoreContext = () => {
//     if (userRole === "supervisor") {
//       return user?.assignedStoreId || user?.storeId;
//     }
//     return user?.storeId || null;
//   };

//   const storeId = getStoreContext();
//   const isSupervisor = userRole === "supervisor";

//   const { data: orders = [], isLoading } = useQuery<any[]>({
//     queryKey: ["/api/admin/orders", storeId, userRole],
//     queryFn: async () => {
//       if (!storeId && isSupervisor) {
//         return [];
//       }
      
//       const url = isSupervisor 
//         ? `/api/supervisor/orders?storeId=${storeId}`
//         : `/api/admin/orders${storeId ? `?storeId=${storeId}` : ''}`;
        
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch orders");
//       return res.json();
//     },
//     enabled: !!storeId || !isSupervisor,
//     staleTime: 0,
//     gcTime: 0,
//   });

//   // Update order status mutation
//   const updateOrderStatusMutation = useMutation({
//     mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
//       const endpoint = isSupervisor 
//         ? `/api/supervisor/orders/${orderId}/status` 
//         : `/api/admin/orders/${orderId}/status`;
//       return apiRequest("PUT", endpoint, { status });
//     },
//     onSuccess: (updatedOrder: any) => {
//       toast({
//         title: "Order Updated",
//         description: "Order status has been updated successfully.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
//       if (selectedOrder && selectedOrder.id === updatedOrder.id) {
//         setSelectedOrder({ ...selectedOrder, status: updatedOrder.status });
//       }
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Update Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Update payment status mutation
//   const updatePaymentStatusMutation = useMutation({
//     mutationFn: ({ orderId, paymentStatus }: { orderId: number; paymentStatus: string }) => {
//       const endpoint = isSupervisor 
//         ? `/api/supervisor/orders/${orderId}/payment-status` 
//         : `/api/admin/orders/${orderId}/payment-status`;
//       return apiRequest("PUT", endpoint, { paymentStatus });
//     },
//     onSuccess: (updatedOrder: any) => {
//       toast({
//         title: "Payment Status Updated",
//         description: "Payment status has been updated successfully.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-analytics"] });
//       if (selectedOrder && selectedOrder.id === updatedOrder.id) {
//         setSelectedOrder({ ...selectedOrder, paymentStatus: updatedOrder.paymentStatus });
//       }
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Prescription approval mutation
//   const prescriptionApprovalMutation = useMutation({
//     mutationFn: async ({ prescriptionId, status, reviewNotes }: { prescriptionId: number; status: 'approved' | 'rejected'; reviewNotes: string }) => {
//       const endpoint = isSupervisor 
//         ? `/api/supervisor/prescriptions/${prescriptionId}` 
//         : `/api/admin/prescriptions/${prescriptionId}`;
//       return apiRequest("PUT", endpoint, { status, reviewNotes });
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: "Prescription review completed successfully",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/prescriptions"] });
//       setPrescriptionReviewData({
//         prescriptionId: null,
//         status: null,
//         reviewNotes: ''
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const handlePrescriptionApproval = (prescriptionId: number, status: 'approved' | 'rejected') => {
//     if (status === 'rejected' && !prescriptionReviewData.reviewNotes.trim()) {
//       toast({
//         title: "Reason Required for Rejection",
//         description: "Please provide a reason for rejecting this prescription",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     prescriptionApprovalMutation.mutate({
//       prescriptionId,
//       status,
//       reviewNotes: prescriptionReviewData.reviewNotes.trim() || ''
//     });
//   };

//   // Supervisor-specific permissions
//   const canUpdateStatus = (currentStatus: string) => {
//     if (!isSupervisor) return true;
    
//     const supervisorAllowedStatuses = ["pending_prescription_review", "confirmed", "processing", "shipped"];
//     return supervisorAllowedStatuses.includes(currentStatus) || currentStatus === "cancelled";
//   };

//   const isStatusDisabled = (currentStatus: string, optionStatus: string) => {
//     if (!canUpdateStatus(currentStatus)) {
//       return true;
//     }
    
//     if (isSupervisor && optionStatus === "delivered") {
//       return true;
//     }
    
//     const statusHierarchy = ["pending_prescription_review", "confirmed", "processing", "shipped", "delivered"];
//     const currentIndex = statusHierarchy.indexOf(currentStatus);
//     const optionIndex = statusHierarchy.indexOf(optionStatus);
    
//     if (optionStatus === "cancelled") {
//       return currentStatus === "delivered";
//     }
    
//     if (currentIndex >= 0 && optionIndex >= 0) {
//       return optionIndex < currentIndex;
//     }
    
//     return false;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "confirmed":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "pending_prescription_review":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "processing":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "shipped":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "delivered":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "cancelled":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "confirmed":
//         return <CheckCircle className="h-4 w-4" />;
//       case "pending_prescription_review":
//         return <AlertCircle className="h-4 w-4" />;
//       case "processing":
//         return <Clock className="h-4 w-4" />;
//       case "shipped":
//         return <Truck className="h-4 w-4" />;
//       case "delivered":
//         return <Package className="h-4 w-4" />;
//       case "cancelled":
//         return <XCircle className="h-4 w-4" />;
//       default:
//         return <Clock className="h-4 w-4" />;
//     }
//   };

//   const handleStatusUpdate = (orderId: number, newStatus: string) => {
//     if (isStatusDisabled(order.status, newStatus)) {
//       toast({
//         title: "Action Not Allowed",
//         description: isSupervisor 
//           ? "Supervisors cannot update this order status. Please contact an admin." 
//           : "This status transition is not allowed.",
//         variant: "destructive",
//       });
//       return;
//     }
//     updateOrderStatusMutation.mutate({ orderId, status: newStatus });
//   };

//   const handlePaymentStatusUpdate = (orderId: number, paymentStatus: string) => {
//     if (isSupervisor && order.status !== "shipped" && order.status !== "delivered") {
//       toast({
//         title: "Action Not Allowed",
//         description: "Supervisors can only update payment status for shipped or delivered orders.",
//         variant: "destructive",
//       });
//       return;
//     }
//     updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
//   };

//   const categorizeOrders = () => {
//     const activeStatuses = ["pending_prescription_review", "confirmed", "processing", "shipped"];
//     const completedStatuses = ["delivered"];
//     const cancelledStatuses = ["cancelled"];

//     return {
//       active: orders.filter((order: any) => activeStatuses.includes(order.status)),
//       completed: orders.filter((order: any) => completedStatuses.includes(order.status)),
//       cancelled: orders.filter((order: any) => cancelledStatuses.includes(order.status)),
//       all: orders
//     };
//   };

//   const categorizedOrders = categorizeOrders();

//   const getOrdersForTab = (tab: string) => {
//     const ordersForTab = categorizedOrders[tab as keyof typeof categorizedOrders] || [];
//     return ordersForTab.filter((order: any) => {
//       const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesSearch;
//     });
//   };

//   const statusOptions = isSupervisor 
//     ? [
//         { value: "confirmed", label: "Confirmed" },
//         { value: "processing", label: "Processing" },
//         { value: "shipped", label: "Shipped" },
//         { value: "cancelled", label: "Cancelled" },
//       ]
//     : [
//         { value: "confirmed", label: "Confirmed" },
//         { value: "processing", label: "Processing" },
//         { value: "shipped", label: "Shipped" },
//         { value: "delivered", label: "Delivered" },
//         { value: "cancelled", label: "Cancelled" },
//       ];

//   // COMPLETE Helper function to render order table
//   const renderOrderTable = (orders: any[], isReadOnly = false) => (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Order Number</TableHead>
//           <TableHead>Customer</TableHead>
//           <TableHead>Items</TableHead>
//           <TableHead>Total</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Date</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {orders.map((order: any) => (
//           <TableRow key={order.id}>
//             <TableCell className="font-medium">
//               <div className="flex items-center gap-2">
//                 {order.orderNumber}
//                 {order.prescription && (
//                   <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
//                     <FileText className="h-3 w-3 mr-1" />
//                     RX
//                   </Badge>
//                 )}
//                 {isSupervisor && order.store && (
//                   <Badge variant="secondary" className="text-xs">
//                     {order.store.name}
//                   </Badge>
//                 )}
//               </div>
//             </TableCell>
//             <TableCell>
//               <div>
//                 <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
//                 <p className="text-sm text-muted-foreground">{order.user.email}</p>
//               </div>
//             </TableCell>
//             <TableCell>
//               {order.items?.length || 0} item(s)
//             </TableCell>
//             <TableCell>
//               ₹{parseFloat(order.totalAmount).toLocaleString()}
//             </TableCell>
//             <TableCell>
//               <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
//                 {getStatusIcon(order.status)}
//                 {order.status.replace('_', ' ')}
//               </Badge>
//             </TableCell>
//             <TableCell>
//               {new Date(order.placedAt).toLocaleDateString("en-IN")}
//             </TableCell>
//             <TableCell>
//               <div className="flex items-center gap-2">
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => setSelectedOrder(order)}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden">
//                     <DialogHeader>
//                       <DialogTitle className="text-base sm:text-lg">
//                         {isSupervisor ? "Store Order Details" : "Order Details"} - {order.orderNumber}
//                       </DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                         <div>
//                           <Label className="text-sm">Customer</Label>
//                           <p className="font-medium text-sm sm:text-base">{order.user.firstName} {order.user.lastName}</p>
//                           <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.user.email}</p>
//                         </div>
//                         <div>
//                           <Label className="text-sm">Current Status</Label>
//                           <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit mt-1 text-xs`}>
//                             {getStatusIcon(order.status)}
//                             {order.status.replace('_', ' ')}
//                           </Badge>
//                         </div>
//                       </div>
                      
//                       {!isReadOnly && canUpdateStatus(order.status) && (
//                         <div>
//                           <Label className="text-sm">
//                             {isSupervisor ? "Update Status (Store Level)" : "Update Status"}
//                           </Label>
//                           <div className="flex flex-wrap gap-2 mt-2">
//                             {statusOptions.map((status) => (
//                               <Button
//                                 key={status.value}
//                                 variant={order.status === status.value ? "default" : "outline"}
//                                 size="sm"
//                                 onClick={() => handleStatusUpdate(order.id, status.value)}
//                                 disabled={updateOrderStatusMutation.isPending || isStatusDisabled(order.status, status.value)}
//                                 className={`text-xs ${isStatusDisabled(order.status, status.value) ? "opacity-50 cursor-not-allowed" : ""}`}
//                               >
//                                 {status.label}
//                               </Button>
//                             ))}
//                           </div>
//                           {isSupervisor && (
//                             <p className="text-xs text-muted-foreground mt-1">
//                               Note: Delivered status requires admin approval
//                             </p>
//                           )}
//                         </div>
//                       )}

//                       {/* Payment Status Management - Only show when order is delivered */}
//                       {!isReadOnly && order.status === 'delivered' && (
//                         <div className="border-t pt-4">
//                           <Label className="text-sm">Payment Status Management</Label>
//                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
//                             <div className="flex items-center justify-between mb-3">
//                               <div>
//                                 <p className="font-medium text-blue-800 text-sm">Current Payment Status</p>
//                                 <Badge 
//                                   variant={order.paymentStatus === "paid" ? "default" : "secondary"}
//                                   className={`text-xs mt-1 ${
//                                     order.paymentStatus === "paid" 
//                                       ? "bg-green-100 text-green-800 hover:bg-green-100" 
//                                       : "bg-orange-100 text-orange-800 hover:bg-orange-100"
//                                   }`}
//                                 >
//                                   {order.paymentStatus === "paid" ? "Paid" : "Pending"}
//                                 </Badge>
//                               </div>
//                               <div className="text-sm text-blue-600 font-medium">
//                                 ₹{order.totalAmount}
//                               </div>
//                             </div>
                            
//                             <div className="space-y-2">
//                               <p className="text-sm text-blue-700 mb-2">
//                                 Update payment status after delivery confirmation:
//                                 {order.paymentStatus === "pending" && (
//                                   <span className="block text-xs text-orange-600 mt-1">
//                                     Note: Once marked as "Paid", this status cannot be reversed.
//                                   </span>
//                                 )}
//                               </p>
//                               {order.paymentStatus === "paid" && (
//                                 <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-2">
//                                   ✓ Payment confirmed and locked. This status cannot be changed for security reasons.
//                                 </p>
//                               )}
//                               <div className="flex gap-2">
//                                 <Button
//                                   variant={order.paymentStatus === "paid" ? "default" : "outline"}
//                                   size="sm"
//                                   onClick={() => handlePaymentStatusUpdate(order.id, "paid")}
//                                   disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "paid"}
//                                   className="bg-green-600 hover:bg-green-700 text-white text-xs"
//                                 >
//                                   Mark as Paid
//                                 </Button>
//                                 <Button
//                                   variant={order.paymentStatus === "pending" ? "default" : "outline"}
//                                   size="sm"
//                                   onClick={() => handlePaymentStatusUpdate(order.id, "pending")}
//                                   disabled={updatePaymentStatusMutation.isPending || order.paymentStatus === "pending" || order.paymentStatus === "paid"}
//                                   className="bg-orange-600 hover:bg-orange-700 text-white text-xs disabled:bg-gray-400 disabled:hover:bg-gray-400"
//                                 >
//                                   Mark as Pending
//                                 </Button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
                      
//                       {order.prescription && (
//                         <div>
//                           <Label className="text-sm">Prescription Details</Label>
//                           <div className="border rounded-lg p-2 sm:p-3 mt-2">
//                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                               <div className="flex items-center gap-2">
//                                 <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
//                                 <div>
//                                   <p className="font-medium text-xs sm:text-sm truncate">{order.prescription.fileName}</p>
//                                   <p className="text-xs text-muted-foreground">
//                                     Uploaded: {new Date(order.prescription.uploadedAt).toLocaleDateString()}
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Badge className={`text-xs ${
//                                   order.prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
//                                   order.prescription.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                                   'bg-yellow-100 text-yellow-800'
//                                 }`}>
//                                   {order.prescription.status}
//                                 </Badge>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   onClick={() => window.open(`/uploads/prescriptions/${order.prescription.fileName}`, '_blank')}
//                                   className="text-xs"
//                                 >
//                                   <FileText className="h-3 w-3 mr-1" />
//                                   View
//                                 </Button>
//                               </div>
//                             </div>
//                             {order.prescription.reviewNotes && (
//                               <div className="mt-2 p-2 bg-gray-50 rounded-lg">
//                                 <p className="text-xs font-medium text-gray-700">Review Notes:</p>
//                                 <p className="text-xs text-gray-600">{order.prescription.reviewNotes}</p>
//                               </div>
//                             )}
//                             {order.prescription.reviewedAt && (
//                               <p className="text-xs text-muted-foreground mt-1">
//                                 Reviewed: {new Date(order.prescription.reviewedAt).toLocaleDateString()}
//                               </p>
//                             )}
                            
//                             {order.prescription.status === 'pending' && (
//                               <div className="mt-3 p-3 border-t bg-blue-50 rounded-b-lg">
//                                 <Label className="text-sm font-medium text-blue-800 mb-2 block">
//                                   Prescription Review
//                                 </Label>
//                                 <div className="space-y-3">
//                                   <div>
//                                     <Label className="text-xs text-gray-700 mb-1 block">
//                                       Review Notes (Required for rejection)
//                                     </Label>
//                                     <Textarea
//                                       placeholder="Provide reason for approval/rejection..."
//                                       value={prescriptionReviewData.prescriptionId === order.prescription.id ? prescriptionReviewData.reviewNotes : ''}
//                                       onChange={(e) => setPrescriptionReviewData({
//                                         prescriptionId: order.prescription.id,
//                                         status: null,
//                                         reviewNotes: e.target.value
//                                       })}
//                                       className="text-xs resize-none"
//                                       rows={2}
//                                     />
//                                   </div>
//                                   <div className="flex gap-2">
//                                     <Button
//                                       size="sm"
//                                       onClick={() => handlePrescriptionApproval(order.prescription.id, 'approved')}
//                                       disabled={prescriptionApprovalMutation.isPending}
//                                       className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
//                                     >
//                                       <Check className="h-3 w-3 mr-1" />
//                                       Approve
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       onClick={() => handlePrescriptionApproval(order.prescription.id, 'rejected')}
//                                       disabled={prescriptionApprovalMutation.isPending}
//                                       className="text-xs flex-1"
//                                     >
//                                       <XCircle className="h-3 w-3 mr-1" />
//                                       Reject
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
                      
//                       <div>
//                         <Label className="text-sm">Order Items ({order.items?.length || 0})</Label>
//                         <div className="border rounded-lg mt-2">
//                           <div className="max-h-48 overflow-y-auto p-2 sm:p-3">
//                             {order.items?.map((item: any, index: number) => (
//                               <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="font-medium text-xs sm:text-sm truncate">{item.medicine?.name}</p>
//                                   <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
//                                 </div>
//                                 <p className="font-medium text-xs sm:text-sm">₹{parseFloat(item.unitPrice).toLocaleString()}</p>
//                               </div>
//                             ))}
//                           </div>
//                           <div className="flex justify-between items-center p-2 sm:p-3 border-t font-semibold bg-gray-50">
//                             <span className="text-sm">Total Amount</span>
//                             <span className="text-sm sm:text-base">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
                
//                 {/* Role-based action buttons */}
//                 {!isReadOnly && !isSupervisor && order.status === "pending_prescription_review" && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleStatusUpdate(order.id, "confirmed")}
//                     disabled={updateOrderStatusMutation.isPending}
//                   >
//                     <Check className="h-4 w-4 mr-1" />
//                     Approve
//                   </Button>
//                 )}
                
//                 {!isReadOnly && isSupervisor && order.status === "pending_prescription_review" && (
//                   <Button
//                     size="sm"
//                     onClick={() => handleStatusUpdate(order.id, "confirmed")}
//                     disabled={updateOrderStatusMutation.isPending}
//                   >
//                     <Check className="h-4 w-4 mr-1" />
//                     Confirm
//                   </Button>
//                 )}
                
//                 {!isReadOnly && order.status === "confirmed" && canUpdateStatus(order.status) && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleStatusUpdate(order.id, "processing")}
//                     disabled={updateOrderStatusMutation.isPending}
//                   >
//                     Process
//                   </Button>
//                 )}
//               </div>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );

//   const headerTitle = isSupervisor ? "Store Order Management" : "Order Management";
//   const headerDescription = isSupervisor 
//     ? "Manage orders for your assigned store" 
//     : "Manage all customer orders across all stores";

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-6">
//         <div className="space-y-4">
//           {[...Array(5)].map((_, i) => (
//             <Card key={i} className="animate-pulse">
//               <CardContent className="p-6">
//                 <div className="h-16 bg-gray-200 rounded"></div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold">{headerTitle}</h1>
//           <p className="text-sm sm:text-base text-muted-foreground">{headerDescription}</p>
//           {isSupervisor && storeId && (
//             <p className="text-xs text-blue-600 mt-1">
//               Store: {user?.storeName || `Store ID: ${storeId}`}
//             </p>
//           )}
//         </div>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
//           <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}>
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//           <div className="flex items-center gap-2">
//             <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
//             <span className="text-base sm:text-lg font-semibold">
//               {isSupervisor ? `${orders.length} Store Orders` : `${orders.length} Total Orders`}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <Card className="mb-4 sm:mb-6">
//         <CardContent className="p-3 sm:p-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder={isSupervisor ? "Search store orders..." : "Search orders..."}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 text-sm sm:text-base"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Smart Order Management Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
//         <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
//           <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2">
//             <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Active Orders</span>
//             <span className="sm:hidden">Active</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.active.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="completed" className="flex items-center gap-1 sm:gap-2">
//             <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Completed</span>
//             <span className="sm:hidden">Done</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.completed.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="cancelled" className="flex items-center gap-1 sm:gap-2">
//             <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">Cancelled</span>
//             <span className="sm:hidden">Cancel</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.cancelled.length}
//             </Badge>
//           </TabsTrigger>
//           <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2">
//             <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
//             <span className="hidden sm:inline">All Orders</span>
//             <span className="sm:hidden">All</span>
//             <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
//               {categorizedOrders.all.length}
//             </Badge>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Orders Tab - NOW COMPLETE WITH TABLE */}
//         <TabsContent value="active">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Activity className="h-5 w-5 text-blue-600" />
//                 Active Orders ({getOrdersForTab("active").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Orders requiring attention: pending review, confirmed, processing, or shipped
//               </p>
//             </CardHeader>
//             <CardContent className="pt-0">
//               {getOrdersForTab("active").length === 0 ? (
//                 <div className="text-center py-12">
//                   <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
//                   <p className="text-muted-foreground">
//                     {isSupervisor 
//                       ? "No active orders for your store." 
//                       : "All orders are either completed or cancelled."
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("active"))
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Completed Orders Tab */}
//         <TabsContent value="completed">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//                 Completed Orders ({getOrdersForTab("completed").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Successfully delivered orders with payment management
//               </p>
//             </CardHeader>
//             <CardContent className="pt-0">
//               {getOrdersForTab("completed").length === 0 ? (
//                 <div className="text-center py-12">
//                   <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
//                   <p className="text-muted-foreground">
//                     {isSupervisor 
//                       ? "No completed orders for your store." 
//                       : "No orders have been completed yet."
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("completed"), false)
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Cancelled Orders Tab */}
//         <TabsContent value="cancelled">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <XCircle className="h-5 w-5 text-red-600" />
//                 Cancelled Orders ({getOrdersForTab("cancelled").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 Orders that were cancelled (read-only)
//               </p>
//             </CardHeader>
//             <CardContent className="pt-0">
//               {getOrdersForTab("cancelled").length === 0 ? (
//                 <div className="text-center py-12">
//                   <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Cancelled Orders</h3>
//                   <p className="text-muted-foreground">
//                     {isSupervisor 
//                       ? "No cancelled orders for your store." 
//                       : "No orders have been cancelled."
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("cancelled"), true)
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* All Orders Tab */}
//         <TabsContent value="all">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Archive className="h-5 w-5 text-gray-600" />
//                 All Orders ({getOrdersForTab("all").length})
//               </CardTitle>
//               <p className="text-muted-foreground text-sm">
//                 {isSupervisor 
//                   ? "Complete order history for your store" 
//                   : "Complete order history and archive"
//                 }
//               </p>
//             </CardHeader>
//             <CardContent className="pt-0">
//               {getOrdersForTab("all").length === 0 ? (
//                 <div className="text-center py-12">
//                   <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Orders</h3>
//                   <p className="text-muted-foreground">
//                     {isSupervisor 
//                       ? "No orders for your store yet." 
//                       : "No orders have been placed yet."
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 renderOrderTable(getOrdersForTab("all"))
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }



















import { useState, useMemo, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";

interface OrderManagementProps {
  userRole?: string; 
}

// Dummy data for development
const generateDummyOrders = (count = 12, userRole = "admin") => {
  const statuses = [
    "pending_prescription_review",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];
  

  const firstNames = ["John", "Jane", "Mike", "Sarah", "David", "Emily", "Chris", "Lisa", "Tom", "Anna"];
  const lastNames = ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson"];
  const medicines = [
    "Paracetamol 500mg",
    "Ibuprofen 400mg",
    "Amoxicillin 500mg",
    "Cetirizine 10mg",
    "Metformin 500mg",
    "Amlodipine 5mg",
    "Losartan 50mg",
    "Atorvastatin 20mg"
  ];
  
  const storeNames = userRole === "supervisor" 
    ? ["Pharmacy Central", "MediCare Store", "HealthPlus Pharmacy"]
    : ["Pharmacy Central", "MediCare Store", "HealthPlus Pharmacy", "Wellness Pharmacy", "CareRx Store"];

  const now = new Date();
  const orders = [];
  
  for (let i = 0; i < count; i++) {
    const orderNumber = `ORD${String(1000 + i).padStart(4, '0')}`;
    const placedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasPrescription = Math.random() > 0.6; // 40% chance of prescription
    const storeId = userRole === "supervisor" ? 1 : Math.floor(Math.random() * 5) + 1; // Supervisors only see store 1
    
    const items = [];
    const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const medicine = medicines[Math.floor(Math.random() * medicines.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      const unitPrice = Math.floor(Math.random() * 200) + 50; // ₹50-₹250
      const itemTotal = unitPrice * quantity;
      totalAmount += itemTotal;
      
      items.push({
        id: j + 1,
        medicine: { id: j + 1, name: medicine },
        quantity,
        unitPrice,
        total: itemTotal
      });
    }
    
    // Add some delivery fee
    totalAmount += Math.random() > 0.5 ? 50 : 0; // 50% chance of delivery fee
    
    const order = {
      id: i + 1,
      orderNumber,
      user: {
        id: i + 1,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
      },
      items,
      totalAmount: totalAmount.toFixed(2),
      status,
      // paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      placedAt: placedAt.toISOString(),
      storeId,
      store: userRole === "supervisor" 
        ? { id: 1, name: storeNames[0] }
        : { id: storeId, name: storeNames[storeId - 1] }
    };
    
    // Add prescription data if needed
    if (hasPrescription) {
      const prescriptionStatus = status === "pending_prescription_review" ? "pending" : 
                                Math.random() > 0.5 ? "approved" : "rejected";
      order.prescription = {
        id: i + 1,
        fileName: `prescription_${orderNumber.toLowerCase()}.pdf`,
        uploadedAt: placedAt.toISOString(),
        status: prescriptionStatus,
        reviewNotes: prescriptionStatus === "rejected" ? "Dosage appears incorrect for patient's age" : null,
        reviewedAt: prescriptionStatus !== "pending" ? new Date(placedAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null
      };
    }
    
    // Add delivery address
    order.deliveryAddress = {
      fullName: `${order.user.firstName} ${order.user.lastName}`,
      address: "123 Green Street, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: order.user.phone
    };
    
    orders.push(order);
  }
  
  return orders;
};

export default function AdminOrders({ userRole = "admin" }: OrderManagementProps) {



  const [ods, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/orders2");
        console.log(response);
        
        const data = await response.json();
        console.log("data");
        console.log(data);
        setOrders(data.orders);
      } catch (error) {
       
        console.error("Error fetching orders:", error);
      } 
    };

    fetchOrders();
  }, []);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptionReviewData, setPrescriptionReviewData] = useState<{
    prescriptionId: number | null;
    status: 'approved' | 'rejected' | null;
    reviewNotes: string;
  }>({
    prescriptionId: null,
    status: null,
    reviewNotes: ''
  });

  // Determine store context based on role
  const getStoreContext = () => {
    if (userRole === "supervisor") {
      return user?.assignedStoreId || user?.storeId || 1; // Default to store 1 for supervisor
    }
    return user?.storeId || null;
  };

  const storeId = getStoreContext();
  const isSupervisor = userRole === "supervisor";

  // Use dummy data for development - replace with real API in production
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders", storeId, userRole],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use dummy data for development
      const dummyOrders = generateDummyOrders(isSupervisor ? 8 : 12, userRole);
      
      // Filter for supervisors - only show orders from their store
      if (isSupervisor) {
        return dummyOrders.filter(order => order.storeId === storeId);
      }
      
      return dummyOrders;
    },
    enabled: true, // Always enabled for dummy data
    staleTime: 5 * 60 * 1000, // 5 minutes for development
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
      // For dummy data, just return a mock response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: orderId,
            status,
            updatedAt: new Date().toISOString()
          });
        }, 1000);
      });
    },
    onSuccess: (updatedOrder: any) => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
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
    mutationFn: ({ orderId, paymentStatus }: { orderId: number; paymentStatus: string }) => {
      // For dummy data, just return a mock response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: orderId,
            paymentStatus,
            updatedAt: new Date().toISOString()
          });
        }, 1000);
      });
    },
    onSuccess: (updatedOrder: any) => {
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-analytics"] });
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

  // Prescription approval mutation
  const prescriptionApprovalMutation = useMutation({
    mutationFn: async ({ prescriptionId, status, reviewNotes }: { prescriptionId: number; status: 'approved' | 'rejected'; reviewNotes: string }) => {
      // For dummy data, just return a mock response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: prescriptionId,
            status,
            reviewNotes,
            reviewedAt: new Date().toISOString()
          });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prescription review completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prescriptions"] });
      setPrescriptionReviewData({
        prescriptionId: null,
        status: null,
        reviewNotes: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePrescriptionApproval = (prescriptionId: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !prescriptionReviewData.reviewNotes.trim()) {
      toast({
        title: "Reason Required for Rejection",
        description: "Please provide a reason for rejecting this prescription",
        variant: "destructive",
      });
      return;
    }
    
    prescriptionApprovalMutation.mutate({
      prescriptionId,
      status,
      reviewNotes: prescriptionReviewData.reviewNotes.trim() || ''
    });
  };

  // Supervisor-specific permissions
  const canUpdateStatus = (currentStatus: string) => {
    if (!isSupervisor) return true;
    
    const supervisorAllowedStatuses = ["pending_prescription_review", "confirmed", "processing", "shipped"];
    return supervisorAllowedStatuses.includes(currentStatus) || currentStatus === "cancelled";
  };

  const isStatusDisabled = (currentStatus: string, optionStatus: string) => {
    if (!canUpdateStatus(currentStatus)) {
      return true;
    }
    
    if (isSupervisor && optionStatus === "delivered") {
      return true;
    }
    
    const statusHierarchy = ["pending_prescription_review", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusHierarchy.indexOf(currentStatus);
    const optionIndex = statusHierarchy.indexOf(optionStatus);
    
    if (optionStatus === "cancelled") {
      return currentStatus === "delivered";
    }
    
    if (currentIndex >= 0 && optionIndex >= 0) {
      return optionIndex < currentIndex;
    }
    
    return false;
  };

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
console.log("ods");
console.log(ods);
  const handleStatusUpdate = (orderId: number, newStatus: string, order?: any) => {
    if (isStatusDisabled(order?.status, newStatus)) {
      toast({
        title: "Action Not Allowed",
        description: isSupervisor 
          ? "Supervisors cannot update this order status. Please contact an admin." 
          : "This status transition is not allowed.",
        variant: "destructive",
      });
      return;
    }
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePaymentStatusUpdate = (orderId: number, paymentStatus: string) => {
    if (isSupervisor && selectedOrder?.status !== "shipped" && selectedOrder?.status !== "delivered") {
      toast({
        title: "Action Not Allowed",
        description: "Supervisors can only update payment status for shipped or delivered orders.",
        variant: "destructive",
      });
      return;
    }
    updatePaymentStatusMutation.mutate({ orderId, paymentStatus });
  };

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

  const statusOptions = isSupervisor 
    ? [
        { value: "confirmed", label: "Confirmed" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "cancelled", label: "Cancelled" },
      ]
    : [
        { value: "confirmed", label: "Confirmed" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ];

  // COMPLETE Helper function to render order table
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
        {ods.map((order: any) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {order.id}
                {order.prescription && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <FileText className="h-3 w-3 mr-1" />
                    RX
                  </Badge>
                )}
                { order.medicine && (
                  <Badge variant="secondary" className="text-xs">
                    {ods.store.name}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{order.customerName}</p>
              </div>
            </TableCell>
            <TableCell>
              {order.medicines?.length || 0} item(s)
            </TableCell>
            <TableCell>
              ₹{parseFloat(order.medicines.reduce((sum, item) => sum + (item.quantity * item.mrp), 0)).toLocaleString()}
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
                      <DialogTitle className="text-base sm:text-lg">
                        {order.id}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-sm">Customer</Label>
                          <p className="font-medium text-sm sm:text-base">{order.customerName} </p>
                          <p className="text-xs text-muted-foreground">+91 {order.mobile_no}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Delivery Address</Label>
                          <div className="text-xs space-y-1">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="truncate">{order.place}</p>
                            <p className="truncate">{order.district}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Store</Label>
                          <p className="font-medium text-sm sm:text-base">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">Store ID: {order.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Current Status</Label>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit mt-1 text-xs`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {!isReadOnly && canUpdateStatus(order.status) && (
                        <div>
                          <Label className="text-sm">
                            {isSupervisor ? "Update Status (Store Level)" : "Update Status"}
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {statusOptions.map((status) => (
                              <Button
                                key={status.value}
                                variant={order.status === status.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, status.value, order)}
                                disabled={updateOrderStatusMutation.isPending || isStatusDisabled(order.status, status.value)}
                                className={`text-xs ${isStatusDisabled(order.status, status.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {status.label}
                              </Button>
                            ))}
                          </div>
                          {isSupervisor && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: Delivered status requires admin approval
                            </p>
                          )}
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
                                ₹{parseFloat(order.totalAmount).toLocaleString()}
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
                            
                            {order.prescription.status === 'pending' && (
                              <div className="mt-3 p-3 border-t bg-blue-50 rounded-b-lg">
                                <Label className="text-sm font-medium text-blue-800 mb-2 block">
                                  Prescription Review
                                </Label>
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs text-gray-700 mb-1 block">
                                      Review Notes (Required for rejection)
                                    </Label>
                                    <Textarea
                                      placeholder="Provide reason for approval/rejection..."
                                      value={prescriptionReviewData.prescriptionId === order.prescription.id ? prescriptionReviewData.reviewNotes : ''}
                                      onChange={(e) => setPrescriptionReviewData({
                                        prescriptionId: order.prescription.id,
                                        status: null,
                                        reviewNotes: e.target.value
                                      })}
                                      className="text-xs resize-none"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handlePrescriptionApproval(order.prescription.id, 'approved')}
                                      disabled={prescriptionApprovalMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handlePrescriptionApproval(order.prescription.id, 'rejected')}
                                      disabled={prescriptionApprovalMutation.isPending}
                                      className="text-xs flex-1"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm">Order Items ({order.items?.length || 0})</Label>
                        <div className="border rounded-lg mt-2">
                          <div className="max-h-48 overflow-y-auto p-2 sm:p-3">
                            {order.medicines?.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{parseFloat(item.mrp).toLocaleString()}</p>
                                </div>
                                <p className="font-medium text-xs sm:text-sm">₹{parseFloat(item.mrp*item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center p-2 sm:p-3 border-t font-semibold bg-gray-50">
                            <span className="text-sm">Total Amount</span>
                            <span className="text-sm sm:text-base">₹{parseFloat(order.medicines.reduce((sum, item) => sum + (item.quantity * item.mrp), 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Role-based action buttons */}
                {!isReadOnly && !isSupervisor && order.status === "pending_prescription_review" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "confirmed", order)}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                
                {!isReadOnly && isSupervisor && order.status === "pending_prescription_review" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, "confirmed", order)}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                
                {!isReadOnly && order.status === "confirmed" && canUpdateStatus(order.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(order.id, "processing", order)}
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

  const headerTitle = isSupervisor ? "Store Order Management" : "Order Management";
  const headerDescription = isSupervisor 
    ? "Manage orders for your assigned store" 
    : "Manage all customer orders across all stores";

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
          <h1 className="text-2xl sm:text-3xl font-bold">{headerTitle}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{headerDescription}</p>
          {isSupervisor && storeId && (
            <p className="text-xs text-blue-600 mt-1">
              Store: {user?.storeName || `Store ID: ${storeId}`}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold">
              {isSupervisor ? `${orders.length} Store Orders` : `${orders.length} Total Orders`}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isSupervisor ? "Search store orders..." : "Search orders..."}
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

        {/* Active Orders Tab - NOW COMPLETE WITH TABLE */}
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
            <CardContent className="pt-0">
              {getOrdersForTab("active").length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
                  <p className="text-muted-foreground">
                    {isSupervisor 
                      ? "No active orders for your store." 
                      : "All orders are either completed or cancelled."
                    }
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
            <CardContent className="pt-0">
              {getOrdersForTab("completed").length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                  <p className="text-muted-foreground">
                    {isSupervisor 
                      ? "No completed orders for your store." 
                      : "No orders have been completed yet."
                    }
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
            <CardContent className="pt-0">
              {getOrdersForTab("cancelled").length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cancelled Orders</h3>
                  <p className="text-muted-foreground">
                    {isSupervisor 
                      ? "No cancelled orders for your store." 
                      : "No orders have been cancelled."
                    }
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
                {isSupervisor 
                  ? "Complete order history for your store" 
                  : "Complete order history and archive"
                }
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {getOrdersForTab("all").length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders</h3>
                  <p className="text-muted-foreground">
                    {isSupervisor 
                      ? "No orders for your store yet." 
                      : "No orders have been placed yet."
                    }
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

