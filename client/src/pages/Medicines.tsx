import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";

export default function Medicines() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Get medicines
  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ["/api/medicines", searchQuery],
    queryKey: searchQuery ? ["/api/medicines", { search: searchQuery }] : ["/api/medicines"],
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/medicine-categories"],
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
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort medicines
  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

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
  }, [medicines, selectedCategory, sortBy]);

  const handleAddToCart = (medicineId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(medicineId);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 20) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Medicines</h1>
        <p className="text-muted-foreground">
          Browse our collection of genuine medicines and healthcare products
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search medicines, brands, or conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          {filteredMedicines.length} medicine(s) found
        </p>
      </div>

      {/* Medicines Grid */}
      {medicinesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMedicines.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine: any) => {
            const stockStatus = getStockStatus(medicine.totalStock);
            return (
              <Card key={medicine.id} className="medicine-card hover:shadow-md transition-all">
                <CardContent className="p-4">
                  {/* Medicine Image Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Package className="h-12 w-12 text-blue-400" />
                  </div>

                  <div className="space-y-2">
                    {/* Name and Badge */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight">{medicine.name}</h3>
                      {medicine.requiresPrescription && (
                        <Badge variant="destructive" className="text-xs ml-2 schedule-h-badge">
                          Schedule H
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {medicine.description}
                    </p>

                    {/* Dosage and Manufacturer */}
                    {medicine.dosage && (
                      <p className="text-xs text-muted-foreground">
                        Dosage: {medicine.dosage}
                      </p>
                    )}
                    {medicine.manufacturer && (
                      <p className="text-xs text-muted-foreground">
                        By {medicine.manufacturer}
                      </p>
                    )}

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
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
                        <span>Prescription required</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(medicine.id)}
                      disabled={medicine.totalStock === 0 || addToCartMutation.isPending}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {medicine.totalStock === 0 ? "Out of Stock" : t('medicine.addToCart')}
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
