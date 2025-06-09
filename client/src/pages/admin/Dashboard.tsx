import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";

export default function Dashboard() {
  // Get dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  // Get recent orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Get low stock medicines
  const { data: lowStockMedicines = [] } = useQuery({
    queryKey: ["/api/admin/low-stock"],
  });

  // Get pending prescriptions
  const { data: pendingPrescriptions = [] } = useQuery({
    queryKey: ["/api/admin/prescriptions"],
  });

  const recentOrders = orders.slice(0, 5);

  // Mock data for charts (in production, this would come from API)
  const salesData = [
    { name: "Mon", sales: 12000 },
    { name: "Tue", sales: 19000 },
    { name: "Wed", sales: 15000 },
    { name: "Thu", sales: 22000 },
    { name: "Fri", sales: 18000 },
    { name: "Sat", sales: 25000 },
    { name: "Sun", sales: 20000 },
  ];

  const categoryData = [
    { name: "General", value: 65, color: "#0ea5e9" },
    { name: "Schedule H", value: 25, color: "#f59e0b" },
    { name: "Ayurvedic", value: 10, color: "#10b981" },
  ];

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Sharda Med administration panel
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/medicines">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{stats?.totalSales?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Orders Today</p>
                    <p className="text-2xl font-bold text-green-800">
                      {stats?.ordersToday || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +8% from yesterday
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {stats?.lowStockCount || 0}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Requires attention
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Pending Prescriptions</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {stats?.pendingPrescriptions || 0}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      <FileText className="h-3 w-3 inline mr-1" />
                      Awaiting review
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Sales"]} />
                <Bar dataKey="sales" fill="hsl(184, 90%, 24%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine Categories</CardTitle>
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
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/medicines">
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:bg-primary/5">
                <Plus className="h-6 w-6" />
                <span>Add Medicine</span>
              </Button>
            </Link>

            <Link href="/admin/bulk-upload">
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:bg-primary/5">
                <Upload className="h-6 w-6" />
                <span>Bulk Upload</span>
              </Button>
            </Link>

            <Link href="/admin/prescriptions">
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:bg-primary/5">
                <FileText className="h-6 w-6" />
                <span>Review Prescriptions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
            <Link href="/admin/medicines">
              <Button variant="ghost" size="sm">
                Manage <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockMedicines.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                All medicines are well stocked
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockMedicines.slice(0, 5).map((medicine: any) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {medicine.totalStock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
