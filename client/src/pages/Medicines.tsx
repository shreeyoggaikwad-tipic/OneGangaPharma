import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop, useScrollToTopOnMount } from "@/hooks/useScrollToTop";
import { useLocation } from "wouter";
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
import shardaMedLogo from "@assets/image_1750072629361.png";

export default function Medicines() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { scrollToTop } = useScrollToTop();
  
  // Scroll to top on page load
  useScrollToTopOnMount();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [location] = useLocation();

  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

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
      scrollToTop();
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
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('medicine.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('app.description')}
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
                placeholder={t('medicine.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
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
              <SelectTrigger className="w-full lg:w-48">
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
            <img
              src={shardaMedLogo}
              alt="Sharda Med"
              className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50"
            />
            <h3 className="text-base sm:text-lg font-semibold mb-2">{t('medicine.noMedicinesFound')}</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('medicine.tryDifferentSearch')}
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
                          {t('medicine.dosage')}: {medicine.dosage}
                        </p>
                      )}
                      {medicine.manufacturer && (
                        <p className="text-xs text-muted-foreground truncate">
                          {t('medicine.manufacturer')}: {medicine.manufacturer}
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
                        <span>{t('medicine.prescriptionRequired')}</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium disabled:from-gray-300 disabled:to-gray-400 disabled:transform-none disabled:shadow-none"
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
