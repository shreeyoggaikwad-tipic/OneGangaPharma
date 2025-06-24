import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Clock, Package, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface SystemConfig {
  minimumShelfLifeMonths: number;
  lowStockThreshold: number;
  expiryWarningDays: number;
  maxItemsPerOrder: number;
}

export default function SuperAdminSystemConfig() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(3);

  const { data: config, isLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/superadmin/config"],
  });

  // Update state when config data loads
  if (config && shelfLifeMonths !== config.minimumShelfLifeMonths) {
    setShelfLifeMonths(config.minimumShelfLifeMonths);
  }

  const updateShelfLifeMutation = useMutation({
    mutationFn: async (months: number) => {
      const response = await fetch("/api/superadmin/config/shelf-life", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: `Minimum shelf life updated to ${shelfLifeMonths} months across all stores`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateShelfLife = () => {
    if (shelfLifeMonths < 1 || shelfLifeMonths > 12) {
      toast({
        title: "Invalid Value",
        description: "Shelf life must be between 1 and 12 months",
        variant: "destructive",
      });
      return;
    }
    updateShelfLifeMutation.mutate(shelfLifeMonths);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Platform Configuration</h1>
            <p className="text-muted-foreground">Manage system-wide settings across all medical stores</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shelf Life Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Global Customer Protection Policy
            </CardTitle>
            <CardDescription>
              Set minimum shelf life requirements for all medical stores on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shelfLife">Minimum Shelf Life (Months)</Label>
              <div className="flex gap-2">
                <Input
                  id="shelfLife"
                  type="number"
                  min="1"
                  max="12"
                  value={shelfLifeMonths}
                  onChange={(e) => setShelfLifeMonths(parseInt(e.target.value) || 1)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpdateShelfLife}
                  disabled={updateShelfLifeMutation.isPending}
                  className="whitespace-nowrap"
                >
                  {updateShelfLifeMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Only medicines with at least {shelfLifeMonths} months remaining will be available for customer purchase 
                across all stores on the platform.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Platform-wide Impact:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• All stores: Medicines with {config?.minimumShelfLifeMonths}+ months shelf life available</li>
                <li>• All stores: Short-expiry medicines (under {config?.minimumShelfLifeMonths} months) hidden from customers</li>
                <li>• All stores: Expired medicines excluded from inventory calculations</li>
                <li>• Ensures consistent customer protection across the entire platform</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Current Platform Settings
            </CardTitle>
            <CardDescription>
              View current configuration values applied to all stores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Low Stock Alert</Label>
                <p className="text-2xl font-bold text-orange-600">{config?.lowStockThreshold}</p>
                <p className="text-xs text-muted-foreground">units threshold</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Expiry Warning</Label>
                <p className="text-2xl font-bold text-red-600">{config?.expiryWarningDays}</p>
                <p className="text-xs text-muted-foreground">days advance notice</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Max Order Items</Label>
                <p className="text-2xl font-bold text-purple-600">{config?.maxItemsPerOrder}</p>
                <p className="text-xs text-muted-foreground">items per order</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Shelf Life Policy</Label>
                <p className="text-2xl font-bold text-green-600">{config?.minimumShelfLifeMonths}</p>
                <p className="text-xs text-muted-foreground">months minimum</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-900 dark:text-amber-100">Super Admin Authority</h4>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                As Super Admin, changes to the {config?.minimumShelfLifeMonths}-month minimum shelf life policy 
                will immediately affect inventory visibility across all medical stores on the platform, 
                ensuring consistent customer protection standards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}