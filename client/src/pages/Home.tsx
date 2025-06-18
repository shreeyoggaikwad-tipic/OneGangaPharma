import { useState, useMemo, useRef } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CheckCircle,
  Clock,
  Package2,
  MapPin,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

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
    queryKey: searchQuery
      ? ["/api/medicines", { search: searchQuery }]
      : ["/api/medicines"],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (medicineId: number) =>
      apiRequest("POST", "/api/cart", { medicineId, quantity: 1 }),
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Medicine has been added to your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      // Clear search bar after adding to cart for better UX
      setSearchQuery("");
      
      // Scroll back to search bar for better UX
      if (searchBarRef.current) {
        searchBarRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
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

  // Filter and sort medicines based on search query, category, and sort options
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    let filtered = medicines as any[];
    
    // Filter by search query
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (medicine: any) =>
        medicine.name.toLowerCase().includes(query) ||
        medicine.description?.toLowerCase().includes(query) ||
        medicine.manufacturer?.toLowerCase().includes(query) ||
        medicine.category?.name.toLowerCase().includes(query),
    );
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((medicine: any) => 
        medicine.category?.name === selectedCategory
      );
    }
    
    // Sort medicines
    filtered = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "stock":
          return b.totalStock - a.totalStock;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [medicines, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (medicineId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(medicineId);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        variant: "outline" as const,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    if (stock <= 20)
      return {
        label: "Limited Stock",
        variant: "secondary" as const,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return {
      label: "In Stock",
      variant: "default" as const,
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const recentOrders = orders.slice(0, 3);

  // Get medicines by category for preview
  const getMedicinesByCategory = (categoryId: number) => {
    return medicines
      .filter((medicine: any) => medicine.categoryId === categoryId)
      .slice(0, 3);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "placed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
          gradient: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
          description: "Order received and being processed",
        };
      case "confirmed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          gradient: "from-green-500 to-green-600",
          bgColor: "bg-green-50",
          description: "Order confirmed and preparing for shipment",
        };
      case "out_for_delivery":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: Truck,
          gradient: "from-orange-500 to-orange-600",
          bgColor: "bg-orange-50",
          description: "Order is on the way to your location",
        };
      case "delivered":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: Package2,
          gradient: "from-emerald-500 to-emerald-600",
          bgColor: "bg-emerald-50",
          description: "Order successfully delivered",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Package,
          gradient: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-50",
          description: "Processing your order",
        };
    }
  };

  const getOrderProgress = (status: string) => {
    switch (status) {
      case "placed":
        return 25;
      case "confirmed":
        return 50;
      case "out_for_delivery":
        return 75;
      case "delivered":
        return 100;
      default:
        return 0;
    }
  };

  if (user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="gradient-bg rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-lg opacity-90">
            Here's your pharmacy dashboard overview
          </p>
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
                      <p className="text-sm text-blue-600 font-medium">
                        Total Sales
                      </p>
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
                      <p className="text-sm text-green-600 font-medium">
                        Orders Today
                      </p>
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
                      <p className="text-sm text-orange-600 font-medium">
                        Low Stock
                      </p>
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
                      <p className="text-sm text-purple-600 font-medium">
                        Pending Prescriptions
                      </p>
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
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Medicine</span>
                </Button>
              </Link>

              <Link href="/admin/bulk-upload">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Upload className="h-6 w-6" />
                  <span>Bulk Upload</span>
                </Button>
              </Link>

              <Link href="/admin/prescriptions">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
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
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
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

      {/* Search Bar with Filters */}
      <Card className="mb-6" ref={searchBarRef}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search medicines, brands, or health conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories as any[]).map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.trim() && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicinesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  No medicines found
                </h3>
                <p className="text-muted-foreground">
                  Try searching with different keywords or browse our
                  categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {searchResults.map((medicine: any) => {
                  const stockStatus = getStockStatus(medicine.totalStock);
                  return (
                    <Card
                      key={medicine.id}
                      className="medicine-card hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                    >
                      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                        {/* Medicine Image */}
                        <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                          {medicine.frontImageUrl ? (
                            <img
                              src={medicine.frontImageUrl}
                              alt={medicine.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400" />
                          )}
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                          {/* Name and Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-xs sm:text-sm leading-tight flex-1">
                              {medicine.name}
                            </h3>
                            {medicine.requiresPrescription && (
                              <Badge
                                variant="destructive"
                                className="text-xs schedule-h-badge flex-shrink-0"
                              >
                                Schedule H
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">
                            {medicine.description}
                          </p>

                          {/* Dosage and Manufacturer */}
                          <div className="space-y-1">
                            {medicine.dosage && (
                              <p className="text-xs text-muted-foreground truncate">
                                Dosage: {medicine.dosage}
                              </p>
                            )}
                            {medicine.manufacturer && (
                              <p className="text-xs text-muted-foreground truncate">
                                Manufacturer: {medicine.manufacturer}
                              </p>
                            )}
                          </div>

                          {/* Price and Stock */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-base sm:text-lg font-bold text-primary">
                              ₹{parseFloat(medicine.price).toFixed(2)}
                            </span>
                            <Badge
                              variant={stockStatus.variant}
                              className="text-xs"
                            >
                              {stockStatus.label}
                              {medicine.totalStock > 0 &&
                                ` (${medicine.totalStock})`}
                            </Badge>
                          </div>

                          {/* Prescription Warning */}
                          {medicine.requiresPrescription && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Prescription Required</span>
                            </div>
                          )}

                          {/* Add to Cart Button */}
                          <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                            onClick={() => handleAddToCart(medicine.id)}
                            disabled={
                              medicine.totalStock === 0 ||
                              addToCartMutation.isPending
                            }
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {medicine.totalStock === 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/medicines">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">
                Search Medicines / Products
              </h3>
              <p className="text-sm text-muted-foreground">
                Find your medicines quickly
              </p>
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
              <p className="text-sm text-muted-foreground">
                For Schedule H medicines
              </p>
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
              <p className="text-sm text-muted-foreground">
                Check delivery status
              </p>
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
                const totalMedicines = (medicines as any[]).filter(
                  (medicine: any) => medicine.categoryId === category.id,
                ).length;

                // Define gradient colors for categories
                const gradients = [
                  "from-blue-500 to-blue-600",
                  "from-green-500 to-green-600",
                  "from-purple-500 to-purple-600",
                  "from-orange-500 to-orange-600",
                  "from-pink-500 to-pink-600",
                  "from-indigo-500 to-indigo-600",
                  "from-teal-500 to-teal-600",
                  "from-red-500 to-red-600",
                ];

                const bgColors = [
                  "bg-blue-50 border-blue-200",
                  "bg-green-50 border-green-200",
                  "bg-purple-50 border-purple-200",
                  "bg-orange-50 border-orange-200",
                  "bg-pink-50 border-pink-200",
                  "bg-indigo-50 border-indigo-200",
                  "bg-teal-50 border-teal-200",
                  "bg-red-50 border-red-200",
                ];

                const gradient = gradients[index % gradients.length];
                const bgColor = bgColors[index % bgColors.length];

                return (
                  <Link
                    key={category.id}
                    href={`/medicines?category=${encodeURIComponent(category.name)}`}
                  >
                    <Card
                      className={`hover:shadow-xl transition-all duration-300 cursor-pointer group ${bgColor}`}
                    >
                      <CardContent className="p-0">
                        {/* Category Header with Gradient */}
                        <div
                          className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}
                        >
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Package className="h-6 w-6" />
                                {category.isScheduleH && (
                                  <Shield className="h-5 w-5" />
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {totalMedicines}
                                </div>
                                <div className="text-xs opacity-90">
                                  medicines
                                </div>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-sm opacity-90 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full"></div>
                        </div>

                        {/* Medicine Preview */}
                        <div className="p-4">
                          {category.isScheduleH && (
                            <Badge
                              variant="destructive"
                              className="mb-3 text-xs"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Prescription Required
                            </Badge>
                          )}

                          {categoryMedicines.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Featured Medicines:
                              </div>
                              {categoryMedicines.map((medicine: any) => (
                                <div
                                  key={medicine.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="font-medium truncate">
                                    {medicine.name}
                                  </span>
                                  <span className="text-primary font-bold">
                                    ₹{medicine.price}
                                  </span>
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
                              <p className="text-sm text-muted-foreground">
                                No medicines yet
                              </p>
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
                {recentOrders.map((order: any) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.placedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={statusConfig.color}>
                          {order.status.replace("_", " ")}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
