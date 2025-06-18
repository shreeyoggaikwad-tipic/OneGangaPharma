import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop, useScrollToTopOnMount } from "@/hooks/useScrollToTop";
import type { CartItem, Medicine } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DestructiveButton } from "@/components/ui/destructive-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Package,
  ArrowRight,
} from "lucide-react";

export default function Cart() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { scrollToTop } = useScrollToTop();
  
  // Scroll to top on page load
  useScrollToTopOnMount();

  // Get cart items
  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { medicine: Medicine })[]>({
    queryKey: ["/api/cart"],
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      apiRequest("PUT", `/api/cart/${id}`, { quantity }),
    onSuccess: () => {
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

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cart/${id}`),
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
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

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/cart"),
    onSuccess: () => {
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
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

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    updateCartMutation.mutate({ id, quantity });
  };

  const removeItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum: number, item) => sum + parseFloat(item.medicine.price) * item.quantity,
    0
  );

  const hasScheduleHMedicines = cartItems.some((item) => item.medicine.requiresPrescription);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('cart.empty')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('cart.emptyMessage')}
            </p>
            <Link href="/medicines">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                {t('medicine.title')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('cart.title')}</h1>
          <p className="text-muted-foreground">{cartItems.length} {t('cart.itemsInCart')}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DestructiveButton size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              {t('cart.clearCart')}
            </DestructiveButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('cart.clearCart')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('cart.clearCartConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DestructiveButton asChild>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              </DestructiveButton>
              <DestructiveButton asChild onClick={clearCart}>
                <AlertDialogAction>
                  {t('cart.clearCart')}
                </AlertDialogAction>
              </DestructiveButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Medicine Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.medicine.frontImageUrl ? (
                      <img
                        src={item.medicine.frontImageUrl}
                        alt={item.medicine.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.medicine.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.medicine.description}
                        </p>
                        {item.medicine.dosage && (
                          <p className="text-xs text-muted-foreground">
                            Dosage: {item.medicine.dosage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.medicine.requiresPrescription && (
                          <Badge variant="destructive" className="text-xs">
                            Schedule H
                          </Badge>
                        )}
                        <DestructiveButton
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </DestructiveButton>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value);
                            if (quantity > 0) {
                              updateQuantity(item.id, quantity);
                            }
                          }}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{(parseFloat(item.medicine.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{parseFloat(item.medicine.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {hasScheduleHMedicines && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Prescription Required
                      </p>
                      <p className="text-sm text-orange-700">
                        Your cart contains Schedule H medicines. You'll need to upload a prescription during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  {t('cart.checkout')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link href="/medicines">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">COD</span>
                </div>
                <span className="text-sm">Cash on Delivery</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
