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
    let filtered = medicines as any[];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((medicine: any) => 
        medicine.name.toLowerCase().includes(query) ||
        medicine.description?.toLowerCase().includes(query) ||
        medicine.manufacturer?.toLowerCase().includes(query) ||
        medicine.category?.name.toLowerCase().includes(query)
      );
    }

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
        title: t('auth.login'),
        description: t('auth.signInMessage'),
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(medicineId);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { 
      label: t('medicine.outOfStock'), 
      variant: "destructive" as const,
      color: "text-red-600",
      bgColor: "bg-red-50"
    };
    if (stock <= 10) return { 
      label: t('admin.outOfStock'), 
      variant: "outline" as const,
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    };
    if (stock <= 20) return { 
      label: t('medicine.lowStock'), 
      variant: "secondary" as const,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    };
    return { 
      label: t('medicine.inStock'), 
      variant: "default" as const,
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('medicine.title')}</h1>
        <p className="text-muted-foreground">
          {t('app.description')}
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
                placeholder={t('medicine.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('common.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('medicine.allCategories')}</SelectItem>
                {(categories as any[]).map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('medicine.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('medicine.sortByName')}</SelectItem>
                <SelectItem value="price-low">{t('common.price')}: {t('medicine.sortByPrice')} (Low to High)</SelectItem>
                <SelectItem value="price-high">{t('common.price')}: {t('medicine.sortByPrice')} (High to Low)</SelectItem>
                <SelectItem value="stock">{t('common.quantity')}</SelectItem>
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
      ) : (filteredMedicines as any[]).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('medicine.noMedicinesFound')}</h3>
            <p className="text-muted-foreground">
              {t('medicine.tryDifferentSearch')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filteredMedicines as any[]).map((medicine: any) => {
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
                        {t('medicine.dosage')}: {medicine.dosage}
                      </p>
                    )}
                    {medicine.manufacturer && (
                      <p className="text-xs text-muted-foreground">
                        {t('medicine.manufacturer')}: {medicine.manufacturer}
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
                        <span>{t('medicine.prescriptionRequired')}</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                      onClick={() => handleAddToCart(medicine.id)}
                      disabled={medicine.totalStock === 0 || addToCartMutation.isPending}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {medicine.totalStock === 0 ? t('medicine.outOfStock') : t('medicine.addToCart')}
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
