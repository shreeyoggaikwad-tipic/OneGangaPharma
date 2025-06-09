import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  Download,
  FileText,
  IndianRupee,
} from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState("7days");
  const [reportType, setReportType] = useState("sales");

  // Get dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  // Get medicines for top selling report
  const { data: medicines = [] } = useQuery({
    queryKey: ["/api/medicines"],
  });

  // Get orders for sales analysis
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Mock data for charts (in production, this would be calculated from real data)
  const salesData = [
    { date: "2024-01-01", sales: 12000, orders: 15 },
    { date: "2024-01-02", sales: 15000, orders: 18 },
    { date: "2024-01-03", sales: 18000, orders: 22 },
    { date: "2024-01-04", sales: 14000, orders: 16 },
    { date: "2024-01-05", sales: 22000, orders: 28 },
    { date: "2024-01-06", sales: 25000, orders: 32 },
    { date: "2024-01-07", sales: 20000, orders: 25 },
  ];

  const topMedicines = [
    { name: "Paracetamol 500mg", sold: 150, revenue: 6825 },
    { name: "Vitamin D3 Tablets", sold: 89, revenue: 11125 },
    { name: "Cough Syrup", sold: 67, revenue: 5963 },
    { name: "Antibiotic Tablets", sold: 45, revenue: 8347 },
    { name: "Ashwagandha Capsules", sold: 32, revenue: 9568 },
  ];

  const categoryData = [
    { name: "General", value: 65, color: "#0ea5e9", sales: 45000 },
    { name: "Schedule H", value: 25, color: "#f59e0b", sales: 28000 },
    { name: "Ayurvedic", value: 10, color: "#10b981", sales: 12000 },
  ];

  const exportReport = (type: string) => {
    // In a real application, this would generate and download actual reports
    const data = type === "sales" ? salesData : topMedicines;
    const csv = type === "sales" 
      ? "Date,Sales,Orders\n" + salesData.map(row => `${row.date},${row.sales},${row.orders}`).join('\n')
      : "Medicine,Quantity Sold,Revenue\n" + topMedicines.map(row => `${row.name},${row.sold},${row.revenue}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track performance and analyze business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport(reportType)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{stats?.totalSales?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +12% from last period
                    </p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-green-800">
                      {orders.length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +8% from last period
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Avg Order Value</p>
                    <p className="text-2xl font-bold text-purple-800">
                      ₹{orders.length > 0 ? Math.round(stats?.totalSales / orders.length) : 0}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +5% from last period
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Products Sold</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {medicines.length}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      <Package className="h-3 w-3 inline mr-1" />
                      Total catalog items
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Trend</CardTitle>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `₹${value}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                />
                <Line 
                  type="monotone" 
                  dataKey={reportType} 
                  stroke="hsl(184, 90%, 24%)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="sales"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, "Sales"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Selling Medicines</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportReport("medicines")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMedicines.map((medicine, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medicine.sold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{medicine.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Order Trends</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportReport("orders")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter((o: any) => o.status === "delivered").length}
                  </div>
                  <div className="text-sm text-blue-700">Delivered</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter((o: any) => o.status === "out_for_delivery").length}
                  </div>
                  <div className="text-sm text-orange-700">In Transit</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Order Status Distribution</h4>
                {["placed", "confirmed", "out_for_delivery", "delivered"].map((status) => {
                  const count = orders.filter((o: any) => o.status === status).length;
                  const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
