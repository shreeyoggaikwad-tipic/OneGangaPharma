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
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending";
  orderDate: string;
  items: number;
}

interface PaymentAnalyticsProps {
  children: React.ReactNode;
}

export function PaymentAnalytics({ children }: PaymentAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [isOpen, setIsOpen] = useState(false);

  const { data: paymentData = [], isLoading } = useQuery<PaymentAnalyticsData[]>({
    queryKey: ["/api/admin/payment-analytics", dateFilter],
    enabled: isOpen,
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
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const sendWhatsAppReminder = (order: PaymentAnalyticsData) => {
    const message = `Dear ${order.customerName},

This is a gentle reminder from Sharda Med regarding your order #${order.orderNumber} worth ₹${order.totalAmount.toFixed(2)}.

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
        `${order.orderNumber},${order.customerName},${order.customerPhone},₹${order.totalAmount.toFixed(2)},${order.paymentMethod},${order.paymentStatus},${order.orderDate},${order.items}`
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Payment Analytics Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <p className="text-xs text-gray-500 mt-1">₹{totalPending.toFixed(2)} outstanding</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Paid Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                <p className="text-xs text-gray-500 mt-1">Completed payments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                <p className="text-xs text-gray-500 mt-1">For selected period</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[140px]">
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
            
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Payment Analytics Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <TableCell className="font-mono text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.customerName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {order.customerPhone}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                            {order.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.items}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
      </DialogContent>
    </Dialog>
  );
}