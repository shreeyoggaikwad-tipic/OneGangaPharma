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
  Package,
  ArrowRight,
  Star,
  Shield,
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

  // Get categories and medicines
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/medicine-categories"],
  });

  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ["/api/medicines"],
  });

  const recentOrders = orders.slice(0, 3);

  // Get medicines by category for preview
  const getMedicinesByCategory = (categoryId: number) => {
    return medicines.filter((medicine: any) => medicine.categoryId === categoryId).slice(0, 3);
  };

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

      {/* Medicine Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Browse by Category</CardTitle>
          <Link href="/medicines">
            <Button variant="ghost" size="sm">
              View All Medicines <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(categories as any[]).map((category: any, index: number) => {
                const categoryMedicines = getMedicinesByCategory(category.id);
                const totalMedicines = (medicines as any[]).filter((medicine: any) => medicine.categoryId === category.id).length;
                
                // Define gradient colors for categories
                const gradients = [
                  "from-blue-500 to-blue-600",
                  "from-green-500 to-green-600", 
                  "from-purple-500 to-purple-600",
                  "from-orange-500 to-orange-600",
                  "from-pink-500 to-pink-600",
                  "from-indigo-500 to-indigo-600",
                  "from-teal-500 to-teal-600",
                  "from-red-500 to-red-600"
                ];
                
                const bgColors = [
                  "bg-blue-50 border-blue-200",
                  "bg-green-50 border-green-200",
                  "bg-purple-50 border-purple-200", 
                  "bg-orange-50 border-orange-200",
                  "bg-pink-50 border-pink-200",
                  "bg-indigo-50 border-indigo-200",
                  "bg-teal-50 border-teal-200",
                  "bg-red-50 border-red-200"
                ];

                const gradient = gradients[index % gradients.length];
                const bgColor = bgColors[index % bgColors.length];

                return (
                  <Link key={category.id} href={`/medicines?category=${encodeURIComponent(category.name)}`}>
                    <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer group ${bgColor}`}>
                      <CardContent className="p-0">
                        {/* Category Header with Gradient */}
                        <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}>
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Package className="h-6 w-6" />
                                {category.isScheduleH && (
                                  <Shield className="h-5 w-5" />
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{totalMedicines}</div>
                                <div className="text-xs opacity-90">medicines</div>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm opacity-90 line-clamp-2">{category.description}</p>
                            )}
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"></div>
                        </div>

                        {/* Medicine Preview */}
                        <div className="p-4">
                          {category.isScheduleH && (
                            <Badge variant="destructive" className="mb-3 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Prescription Required
                            </Badge>
                          )}
                          
                          {categoryMedicines.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2">Featured Medicines:</div>
                              {categoryMedicines.map((medicine: any) => (
                                <div key={medicine.id} className="flex items-center justify-between text-sm">
                                  <span className="font-medium truncate">{medicine.name}</span>
                                  <span className="text-primary font-bold">₹{medicine.price}</span>
                                </div>
                              ))}
                              {totalMedicines > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{totalMedicines - 3} more medicines
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No medicines yet</p>
                            </div>
                          )}

                          {/* View Category Button */}
                          <div className="mt-4 pt-3 border-t">
                            <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:text-primary/80">
                              <span>Explore Category</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
