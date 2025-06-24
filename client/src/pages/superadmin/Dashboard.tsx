import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Store, 
  Users, 
  Settings, 
  BarChart3, 
  Plus, 
  Eye, 
  Building2,
  Shield,
  TrendingUp,
  Activity
} from "lucide-react";

interface SuperAdminStats {
  totalStores: number;
  activeStores: number;
  totalAdmins: number;
  totalCustomers: number;
  totalOrders: number;
  totalSales: number;
}

interface StoreData {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const { data: stats, isLoading: statsLoading } = useQuery<SuperAdminStats>({
    queryKey: ["/api/superadmin/dashboard-stats"],
  });

  const { data: stores, isLoading: storesLoading } = useQuery<StoreData[]>({
    queryKey: ["/api/superadmin/stores"],
  });

  if (statsLoading || storesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage multiple medical stores and platform settings</p>
        </div>
        <Link to="/superadmin/store-onboarding">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Onboard New Store
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/superadmin/stores">
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Store Management</p>
              <p className="text-xs text-gray-600">Manage medical stores</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/superadmin/system-config">
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">System Configuration</p>
              <p className="text-xs text-gray-600">Platform-wide settings</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/superadmin/analytics">
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Platform Analytics</p>
              <p className="text-xs text-gray-600">Cross-store insights</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/superadmin/users">
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:border-orange-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">User Management</p>
              <p className="text-xs text-gray-600">Manage admins & users</p>
            </CardContent>
          </Card>
        </Link>
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
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold">₹{stats?.totalSales?.toLocaleString() || 0}</p>
                <p className="text-green-100 text-xs">Across all stores</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Store Admins</p>
                <p className="text-2xl font-bold">{stats?.totalAdmins || 0}</p>
                <p className="text-purple-100 text-xs">Platform administrators</p>
              </div>
              <Shield className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-orange-100 text-xs">Platform-wide</p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recently Onboarded Stores</CardTitle>
            <Link to="/superadmin/stores">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stores?.slice(0, 5).map((store) => (
              <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{store.name}</p>
                    <p className="text-sm text-gray-600">{store.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={store.isActive ? "default" : "secondary"}>
                    {store.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}