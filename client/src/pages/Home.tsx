import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Upload,
  Truck,
  History,
  ShoppingCart,
  Plus,
  BarChart3,
  AlertTriangle,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Get recent orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Get cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Get dashboard stats for admin
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: user?.role === "admin",
  });

  // Get featured medicines
  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ["/api/medicines"],
  });

  const recentOrders = orders.slice(0, 3);
  const featuredMedicines = medicines.slice(0, 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "out_for_delivery": return "bg-orange-100 text-orange-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="gradient-bg rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
          <p className="text-lg opacity-90">Here's your pharmacy dashboard overview</p>
        </div>

        {/* Dashboard Stats */}
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
                        ₹{dashboardStats?.totalSales?.toLocaleString() || "0"}
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
                        {dashboardStats?.ordersToday || 0}
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
                      <p className="text-sm text-orange-600 font-medium">Low Stock</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {dashboardStats?.lowStockCount || 0}
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
                        {dashboardStats?.pendingPrescriptions || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions for Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/medicines">
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Add Medicine</span>
                </Button>
              </Link>
              
              <Link href="/admin/bulk-upload">
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Bulk Upload</span>
                </Button>
              </Link>
              
              <Link href="/admin/prescriptions">
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Review Prescriptions</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <div className="gradient-bg rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-lg opacity-90">Your health is our priority</p>
        {cartItems.length > 0 && (
          <div className="mt-4">
            <Link href="/cart">
              <Button variant="secondary" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping ({cartItems.length} items)
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/medicines">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Search Medicines</h3>
              <p className="text-sm text-muted-foreground">Find your medicines quickly</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/prescriptions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Upload Prescription</h3>
              <p className="text-sm text-muted-foreground">For Schedule H medicines</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">Track Order</h3>
              <p className="text-sm text-muted-foreground">Check delivery status</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <History className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Order History</h3>
              <p className="text-sm text-muted-foreground">View past orders</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.placedAt).toLocaleDateString()}
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
      )}

      {/* Featured Medicines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Featured Medicines</CardTitle>
          <Link href="/medicines">
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {medicinesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredMedicines.map((medicine: any) => (
                <Card key={medicine.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{medicine.name}</h3>
                      {medicine.requiresPrescription && (
                        <Badge variant="destructive" className="text-xs">Schedule H</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{medicine.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">₹{medicine.price}</span>
                      <Badge variant={medicine.totalStock > 0 ? "default" : "secondary"}>
                        {medicine.totalStock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
