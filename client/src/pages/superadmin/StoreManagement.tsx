import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useLocation } from "wouter";

interface StoreData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  licenseNumber: string;
  gstNumber: string;
  isActive: boolean;
  createdAt: string;
}

export default function StoreManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);

  const { data: stores, isLoading } = useQuery<StoreData[]>({
    queryKey: ["/api/superadmin/stores"],
  });

  const deactivateStoreMutation = useMutation({
    mutationFn: async (storeId: number) => {
      const response = await fetch(`/api/superadmin/stores/${storeId}/deactivate`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to deactivate store");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Store Deactivated",
        description: "The store has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stores"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate store.",
        variant: "destructive",
      });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (storeData: StoreData) => {
      const response = await fetch(`/api/superadmin/stores/${storeData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) {
        throw new Error("Failed to update store");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Store Updated",
        description: "Store information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stores"] });
      setEditingStore(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update store.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStore = () => {
    if (editingStore) {
      updateStoreMutation.mutate(editingStore);
    }
  };

  const filteredStores = stores?.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
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
          <Store className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Store Management</h1>
            <p className="text-gray-600">Manage all medical stores on the platform</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search stores by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate("/superadmin/store-onboarding")}>
          <Plus className="h-4 w-4 mr-2" />
          Onboard New Store
        </Button>
      </div>

      {/* Store Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold">{stores?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Stores</p>
                <p className="text-2xl font-bold text-green-600">
                  {stores?.filter(s => s.isActive).length || 0}
                </p>
              </div>
              <Store className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Stores</p>
                <p className="text-2xl font-bold text-red-600">
                  {stores?.filter(s => !s.isActive).length || 0}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <div className="space-y-4">
        {filteredStores?.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{store.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{store.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{store.city}, {store.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>License: {store.licenseNumber}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Onboarded: {new Date(store.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedStore(store)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Store Details</DialogTitle>
                      </DialogHeader>
                      {selectedStore && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Store Name</Label>
                              <p className="text-lg font-semibold">{selectedStore.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Status</Label>
                              <Badge variant={selectedStore.isActive ? "default" : "secondary"} className="ml-2">
                                {selectedStore.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Email</Label>
                              <p>{selectedStore.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Phone</Label>
                              <p>{selectedStore.phone}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Address</Label>
                            <p>{selectedStore.address}</p>
                            <p>{selectedStore.city}, {selectedStore.state} - {selectedStore.pincode}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">License Number</Label>
                              <p>{selectedStore.licenseNumber}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">GST Number</Label>
                              <p>{selectedStore.gstNumber}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Onboarded</Label>
                            <p>{new Date(selectedStore.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingStore(store)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Store</DialogTitle>
                      </DialogHeader>
                      {editingStore && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="storeName">Store Name</Label>
                              <Input
                                id="storeName"
                                value={editingStore.name}
                                onChange={(e) => setEditingStore({...editingStore, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="storeEmail">Email</Label>
                              <Input
                                id="storeEmail"
                                type="email"
                                value={editingStore.email}
                                onChange={(e) => setEditingStore({...editingStore, email: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="storePhone">Phone</Label>
                              <Input
                                id="storePhone"
                                value={editingStore.phone}
                                onChange={(e) => setEditingStore({...editingStore, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="licenseNumber">License Number</Label>
                              <Input
                                id="licenseNumber"
                                value={editingStore.licenseNumber}
                                onChange={(e) => setEditingStore({...editingStore, licenseNumber: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={editingStore.address}
                              onChange={(e) => setEditingStore({...editingStore, address: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={editingStore.city}
                                onChange={(e) => setEditingStore({...editingStore, city: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={editingStore.state}
                                onChange={(e) => setEditingStore({...editingStore, state: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                value={editingStore.pincode}
                                onChange={(e) => setEditingStore({...editingStore, pincode: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                              id="gstNumber"
                              value={editingStore.gstNumber}
                              onChange={(e) => setEditingStore({...editingStore, gstNumber: e.target.value})}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setEditingStore(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => handleUpdateStore()}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {store.isActive && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deactivateStoreMutation.mutate(store.id)}
                      disabled={deactivateStoreMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStores?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No stores match your search criteria." : "Get started by onboarding your first medical store."}
            </p>
            <Button onClick={() => navigate("/superadmin/store-onboarding")}>
              <Plus className="h-4 w-4 mr-2" />
              Onboard New Store
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}