import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function Medicines() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch medicines
  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ["/api/medicines", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/medicines?search=${encodeURIComponent(searchQuery)}`
        : "/api/medicines";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch medicines");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/medicine-categories"],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (medicineId: number) => {
      return apiRequest("POST", "/api/cart", { medicineId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: "Medicine added to cart successfully",
      });
      // Clear search query after adding to cart
      setSearchQuery("");
      
      // Scroll to search bar
      const searchElement = document.querySelector('input[placeholder*="Search"]');
      if (searchElement) {
        searchElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  // Filter and sort medicines
  const filteredMedicines = useMemo(() => {
    let filtered = [...(medicines as any[])];

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
  }, [medicines, selectedCategory, sortBy, searchQuery]);

  const handleAddToCart = (medicineId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(medicineId);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { 
      label: "Out of Stock", 
      variant: "destructive" as const,
      color: "text-red-600",
      bgColor: "bg-red-50"
    };
    if (stock <= 10) return { 
      label: "Very Low Stock", 
      variant: "outline" as const,
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    };
    if (stock <= 20) return { 
      label: "Low Stock", 
      variant: "secondary" as const,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    };
    return { 
      label: "In Stock", 
      variant: "default" as const,
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse Medicines</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find and order your medicines online with prescription support
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search medicines by name, manufacturer, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
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
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          {(filteredMedicines as any[]).length} medicine(s) found
        </p>
      </div>

      {/* Medicines Grid */}
      {medicinesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <Skeleton className="h-24 sm:h-32 w-full mb-3 sm:mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (filteredMedicines as any[]).length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No medicines found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {(filteredMedicines as any[]).map((medicine: any) => {
            const stockStatus = getStockStatus(medicine.totalStock);
            return (
              <Card key={medicine.id} className="medicine-card hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col border-2 hover:border-primary/20">
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
                      <h3 className="font-semibold text-xs sm:text-sm leading-tight flex-1">{medicine.name}</h3>
                      {medicine.requiresPrescription && (
                        <Badge variant="destructive" className="text-xs schedule-h-badge flex-shrink-0">
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
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                        {medicine.totalStock > 0 && ` (${medicine.totalStock})`}
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
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium disabled:from-gray-300 disabled:to-gray-400 disabled:transform-none disabled:shadow-none"
                      onClick={() => handleAddToCart(medicine.id)}
                      disabled={medicine.totalStock === 0 || addToCartMutation.isPending}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {medicine.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}