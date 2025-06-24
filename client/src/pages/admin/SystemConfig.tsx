import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Clock, Package } from "lucide-react";

interface SystemConfig {
  minimumShelfLifeMonths: number;
  lowStockThreshold: number;
  expiryWarningDays: number;
  maxItemsPerOrder: number;
}

export default function SystemConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(3);

  const { data: config, isLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/admin/config"],
    onSuccess: (data) => {
      setShelfLifeMonths(data.minimumShelfLifeMonths);
    },
  });

  const updateShelfLifeMutation = useMutation({
    mutationFn: async (months: number) => {
      const response = await fetch("/api/admin/config/shelf-life", {
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
        description: `Minimum shelf life updated to ${shelfLifeMonths} months`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
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
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage system-wide settings and policies</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shelf Life Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Customer Protection Policy
            </CardTitle>
            <CardDescription>
              Set minimum shelf life requirements for customer orders
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
                Only medicines with at least {shelfLifeMonths} months remaining will be available for customer purchase.
                Shorter expiry items will be excluded from regular sales.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Policy Impact:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Medicines with {config?.minimumShelfLifeMonths}+ months shelf life: Available for sale</li>
                <li>• Medicines with less than {config?.minimumShelfLifeMonths} months: Hidden from customers</li>
                <li>• Expired medicines: Excluded from all calculations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Other Settings Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Current System Settings
            </CardTitle>
            <CardDescription>
              View current configuration values
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

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium">Policy Effectiveness</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                The {config?.minimumShelfLifeMonths}-month minimum shelf life policy ensures customers receive medicines 
                with adequate time for consumption, improving safety and satisfaction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}