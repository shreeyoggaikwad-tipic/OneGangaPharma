import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MessageCircle, Download, Filter, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentAnalyticsData {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending";
  orderDate: string;
  items: number;
}

interface PaymentAnalyticsProps {
  children: React.ReactNode;
}

// Helper function to safely convert amount to number
const safeAmountToNumber = (amount: number | string): number => {
  if (typeof amount === 'number') return isNaN(amount) ? 0 : amount;
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export function PaymentAnalytics({ children }: PaymentAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [isOpen, setIsOpen] = useState(false);

  const { data: paymentData = [], isLoading } = useQuery<PaymentAnalyticsData[]>({
    queryKey: ["/api/admin/payment-analytics", dateFilter],
    enabled: isOpen,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  const filteredData = paymentData.filter((order: PaymentAnalyticsData) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = filteredData.filter((order: PaymentAnalyticsData) => order.paymentStatus === "pending").length;
  const paidCount = filteredData.filter((order: PaymentAnalyticsData) => order.paymentStatus === "paid").length;
  const totalPending = filteredData
    .filter((order: PaymentAnalyticsData) => order.paymentStatus === "pending")
    .reduce((sum: number, order: PaymentAnalyticsData) => {
      return sum + safeAmountToNumber(order.totalAmount);
    }, 0);

  const sendWhatsAppReminder = (order: PaymentAnalyticsData) => {
    const message = `Dear ${order.customerName},

This is a gentle reminder from Sharda Med regarding your order #${order.orderNumber} worth ₹${safeAmountToNumber(order.totalAmount).toFixed(2)}.

Your payment is still pending. Please complete the payment at your earliest convenience.

Payment Options:
- Cash on Delivery
- UPI: shardamed@upi
- Call us: +91-800-SHARDA-MED

Thank you for choosing Sharda Med!

Best regards,
Sharda Med Team`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportData = () => {
    const csvContent = [
      "Order Number,Customer Name,Phone,Amount,Payment Method,Status,Date,Items",
      ...filteredData.map((order: PaymentAnalyticsData) => 
        `${order.orderNumber},${order.customerName},${order.customerPhone},₹${safeAmountToNumber(order.totalAmount).toFixed(2)},${order.paymentMethod},${order.paymentStatus},${order.orderDate},${order.items}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Payment Analytics Dashboard</span>
            <span className="sm:hidden">Payment Analytics</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card className="min-h-[100px]">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pending Payments</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{pendingCount}</div>
                  <p className="text-xs text-gray-500 mt-1">₹{(totalPending || 0).toFixed(2)} outstanding</p>
                </CardContent>
              </Card>
              
              <Card className="min-h-[100px]">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Paid Orders</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{paidCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Completed payments</p>
                </CardContent>
              </Card>
              
              <Card className="min-h-[100px] sm:col-span-1 col-span-1">
                <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{filteredData.length}</div>
                  <p className="text-xs text-gray-500 mt-1">For selected period</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              {/* Filters and Export */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
                <div className="flex flex-col xs:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full xs:w-[140px] text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full xs:w-[140px] text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={exportData} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>

            {/* Payment Analytics Table */}
            <div className="border rounded-lg overflow-hidden bg-white">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Order Number</TableHead>
                        <TableHead className="text-xs font-semibold">Customer</TableHead>
                        <TableHead className="text-xs font-semibold">Phone</TableHead>
                        <TableHead className="text-xs font-semibold">Amount</TableHead>
                        <TableHead className="text-xs font-semibold">Payment</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-xs font-semibold">Date</TableHead>
                        <TableHead className="text-xs font-semibold">Items</TableHead>
                        <TableHead className="text-xs font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Loading payment data...
                          </TableCell>
                        </TableRow>
                      ) : filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            No orders found for the selected criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((order: PaymentAnalyticsData) => (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {order.customerName}
                            </TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {order.customerPhone}
                            </TableCell>
                            <TableCell className="font-semibold text-xs sm:text-sm">
                              ₹{safeAmountToNumber(order.totalAmount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {order.paymentMethod}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                                className={
                                  order.paymentStatus === "paid" 
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs" 
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs"
                                }
                              >
                                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {order.items}
                            </TableCell>
                            <TableCell>
                              {order.paymentStatus === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsAppReminder(order)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  WhatsApp
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden max-h-[50vh] overflow-y-auto p-2">
                {isLoading ? (
                  <div className="text-center py-8">Loading payment data...</div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found for the selected criteria
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredData.map((order: PaymentAnalyticsData) => (
                      <Card key={order.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="font-mono text-sm font-semibold text-blue-600">
                                {order.orderNumber}
                              </div>
                              <div className="font-medium text-sm">{order.customerName}</div>
                              <div className="font-mono text-xs text-gray-600">{order.customerPhone}</div>
                            </div>
                            <Badge 
                              variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                              className={
                                order.paymentStatus === "paid" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                              }
                            >
                              {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <div className="font-semibold text-lg">
                              ₹{safeAmountToNumber(order.totalAmount).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {order.items} items • {new Date(order.orderDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {order.paymentMethod}
                            </span>
                            {order.paymentStatus === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendWhatsAppReminder(order)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {pendingCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-800">Action Required</h4>
                    <p className="text-sm text-orange-700">
                      {pendingCount} orders have pending payments totaling ₹{totalPending.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      // Send bulk WhatsApp reminders to all pending payments
                      filteredData
                        .filter((order: PaymentAnalyticsData) => order.paymentStatus === "pending")
                        .forEach((order: PaymentAnalyticsData) => {
                          setTimeout(() => sendWhatsAppReminder(order), 1000); // Stagger messages
                        });
                    }}
                  >
                    Send All Reminders
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}