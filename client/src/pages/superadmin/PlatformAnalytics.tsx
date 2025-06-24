import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Store, ShoppingCart, DollarSign, Activity } from "lucide-react";
import { useLocation } from "wouter";

interface PlatformStats {
  totalStores: number;
  activeStores: number;
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  totalMedicines: number;
  recentActivity: {
    newStores: number;
    newUsers: number;
    ordersToday: number;
    salesToday: number;
  };
}

export default function PlatformAnalytics() {
  const [, navigate] = useLocation();

  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/superadmin/platform-analytics"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/superadmin/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-gray-600">Comprehensive platform performance overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Stores</p>
                <p className="text-2xl font-bold">{stats?.totalStores || 0}</p>
                <p className="text-blue-100 text-xs">
                  {stats?.activeStores || 0} active
                </p>
              </div>
              <Store className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-green-100 text-xs">
                  Platform-wide
                </p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-purple-100 text-xs">
                  All stores
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold">₹{stats?.totalSales?.toLocaleString() || 0}</p>
                <p className="text-orange-100 text-xs">
                  Platform revenue
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="font-medium">New Stores</span>
              </div>
              <Badge variant="secondary">{stats?.recentActivity?.newStores || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium">New Users</span>
              </div>
              <Badge variant="secondary">{stats?.recentActivity?.newUsers || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Orders Today</span>
              </div>
              <Badge variant="secondary">{stats?.recentActivity?.ordersToday || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Sales Today</span>
              </div>
              <Badge variant="secondary">₹{stats?.recentActivity?.salesToday?.toLocaleString() || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Store Activation Rate</span>
                <span className="font-medium">
                  {stats?.totalStores ? Math.round((stats.activeStores / stats.totalStores) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.totalStores ? (stats.activeStores / stats.totalStores) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMedicines || 0}</p>
                <p className="text-sm text-gray-600">Total Medicines</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</p>
            <p className="text-sm">Detailed charts and growth trends will be available in the next update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}