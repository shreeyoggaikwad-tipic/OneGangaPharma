import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  ShoppingCart,
  AlertTriangle,
  FileText,
  Package,
  Users,
  TrendingUp,
  Plus,
  Upload,
  Eye,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  IndianRupee,
  Calendar,
  Bell,
  Settings,
  RefreshCw,
  Package2,
  UserCheck,
  Clipboard,
} from "lucide-react";

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [reportType, setReportType] = useState("sales");

  // Get dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  // Get recent orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Get low stock medicines
  const { data: lowStockMedicines = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/low-stock"],
  });

  // Get pending prescriptions
  const { data: pendingPrescriptions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/prescriptions"],
  });

  // Get medicines data
  const { data: medicines = [] } = useQuery<any[]>({
    queryKey: ["/api/medicines"],
  });

  // Fetch real sales data from orders
  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/admin/sales-analytics", timePeriod],
    enabled: !!timePeriod,
  });

  // Fetch real category data from medicines
  const { data: categoryData = [] } = useQuery({
    queryKey: ["/api/admin/category-analytics"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending_prescription_review":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />;
      case "pending_prescription_review":
        return <Clock className="h-3 w-3" />;
      case "processing":
        return <Package className="h-3 w-3" />;
      case "shipped":
        return <Truck className="h-3 w-3" />;
      case "delivered":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your pharmacy overview for today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 text-sm">Common tasks and shortcuts</p>
          </div>
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/medicines">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Add Medicine</p>
                <p className="text-xs text-gray-500">Create new product</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/bulk-upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="p-4 text-center">
                <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Bulk Upload</p>
                <p className="text-xs text-gray-500">Import CSV data</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="p-4 text-center">
                <Package2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Manage Orders</p>
                <p className="text-xs text-gray-500">Process orders</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/prescriptions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Review Prescriptions</p>
                <p className="text-xs text-gray-500">Approve requests</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
            <p className="text-gray-600 text-sm">Today's performance overview</p>
          </div>
          <BarChart3 className="h-6 w-6 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Sales</p>
                  <p className="text-3xl font-bold">
                    ₹{(stats?.totalSales || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2 text-green-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+12% from yesterday</span>
                  </div>
                </div>
                <IndianRupee className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Orders Today</p>
                  <p className="text-3xl font-bold">{stats?.ordersToday || 0}</p>
                  <div className="flex items-center mt-2 text-blue-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+8% from yesterday</span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                  <p className="text-3xl font-bold">{stats?.lowStockCount || 0}</p>
                  <div className="flex items-center mt-2 text-orange-100">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Needs attention</span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Prescriptions</p>
                  <p className="text-3xl font-bold">{stats?.pendingPrescriptions || 0}</p>
                  <div className="flex items-center mt-2 text-purple-100">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Awaiting review</span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Sales Trend ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `₹${(value as number).toLocaleString()}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                  labelFormatter={(label) => label}
                />
                <Area
                  type="monotone"
                  dataKey={reportType}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Medicine Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Recent Orders
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {order.user?.firstName} {order.user?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                        <Badge className={`${getStatusColor(order.status)} text-xs flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
          {/* Smart Stock Status */}
          <Card className={`${lowStockMedicines.length === 0 
            ? 'border-green-200 bg-green-50' 
            : lowStockMedicines.some((m: any) => m.totalStock === 0)
              ? 'border-red-200 bg-red-50'
              : 'border-orange-200 bg-orange-50'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${
                lowStockMedicines.length === 0 
                  ? 'text-green-800' 
                  : lowStockMedicines.some((m: any) => m.totalStock === 0)
                    ? 'text-red-800'
                    : 'text-orange-800'
              }`}>
                {lowStockMedicines.length === 0 ? (
                  <CheckCircle className="h-5 w-5" />
                ) : lowStockMedicines.some((m: any) => m.totalStock === 0) ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockMedicines.length === 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-700 text-sm font-medium">All medicines are well stocked</p>
                  </div>
                  <p className="text-green-600 text-xs">Inventory levels are healthy across all products</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Critical (Out of Stock) */}
                  {lowStockMedicines.filter((m: any) => m.totalStock === 0).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-red-800 text-xs font-semibold uppercase tracking-wide">Critical - Out of Stock</p>
                      </div>
                      {lowStockMedicines.filter((m: any) => m.totalStock === 0).slice(0, 2).map((medicine: any) => (
                        <div key={medicine.id} className="flex items-center justify-between bg-red-100 rounded-lg p-2 border border-red-200">
                          <p className="text-sm font-medium text-red-900">{medicine.name}</p>
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Low Stock Warning */}
                  {lowStockMedicines.filter((m: any) => m.totalStock > 0 && m.totalStock <= 10).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <p className="text-orange-800 text-xs font-semibold uppercase tracking-wide">Low Stock Warning</p>
                      </div>
                      {lowStockMedicines.filter((m: any) => m.totalStock > 0 && m.totalStock <= 10).slice(0, 2).map((medicine: any) => (
                        <div key={medicine.id} className="flex items-center justify-between bg-orange-100 rounded-lg p-2 border border-orange-200">
                          <p className="text-sm font-medium text-orange-900">{medicine.name}</p>
                          <Badge variant="outline" className="text-orange-700 border-orange-400 bg-orange-50">
                            {medicine.totalStock} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href="/admin/medicines">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`w-full mt-2 ${
                        lowStockMedicines.some((m: any) => m.totalStock === 0)
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                      }`}
                    >
                      Manage Inventory ({lowStockMedicines.length})
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Alerts */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <FileText className="h-5 w-5" />
                Prescription Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPrescriptions.length === 0 ? (
                <p className="text-purple-700 text-sm">No pending prescriptions</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-purple-800 font-medium">
                    {pendingPrescriptions.length} prescription(s) awaiting review
                  </p>
                  <Link href="/admin/prescriptions">
                    <Button variant="outline" size="sm" className="w-full">
                      Review Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Medicines</span>
                <span className="font-medium">{medicines.filter((m: any) => m.isActive).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="font-medium">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Orders</span>
                <span className="font-medium">{stats?.ordersToday || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Prescriptions</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-600" />
                  <span className="font-medium text-blue-600">{stats?.pendingPrescriptions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}