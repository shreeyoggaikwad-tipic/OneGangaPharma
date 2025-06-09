import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  Package2,
} from "lucide-react";

const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  price: z.string().min(1, "Price is required"),
  categoryId: z.number().min(1, "Category is required"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  requiresPrescription: z.boolean(),
});

const inventorySchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type MedicineForm = z.infer<typeof medicineSchema>;
type InventoryForm = z.infer<typeof inventorySchema>;

export default function MedicineManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);

  // Get medicines
  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: searchQuery ? ["/api/medicines", { search: searchQuery }] : ["/api/medicines"],
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/medicine-categories"],
  });

  // Medicine form
  const medicineForm = useForm<MedicineForm>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      description: "",
      dosage: "",
      price: "",
      categoryId: 0,
      manufacturer: "",
      requiresPrescription: false,
    },
  });

  // Inventory form
  const inventoryForm = useForm<InventoryForm>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      batchNumber: "",
      expiryDate: "",
      quantity: 0,
    },
  });

  // Create/Update medicine mutation
  const medicineMutation = useMutation({
    mutationFn: (data: MedicineForm & { id?: number }) => {
      if (data.id) {
        return apiRequest("PUT", `/api/admin/medicines/${data.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/medicines", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingMedicine ? "Medicine Updated" : "Medicine Added",
        description: `Medicine has been ${editingMedicine ? "updated" : "added"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      setShowMedicineDialog(false);
      setEditingMedicine(null);
      medicineForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/medicines/${id}`),
    onSuccess: () => {
      toast({
        title: "Medicine Deleted",
        description: "Medicine has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add inventory mutation
  const addInventoryMutation = useMutation({
    mutationFn: (data: InventoryForm & { medicineId: number }) =>
      apiRequest("POST", "/api/admin/inventory", data),
    onSuccess: () => {
      toast({
        title: "Inventory Added",
        description: "Inventory batch has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      setShowInventoryDialog(false);
      setSelectedMedicine(null);
      inventoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter medicines
  const filteredMedicines = (medicines as any[]).filter((medicine: any) => {
    if (selectedCategory !== "all" && medicine.category?.name !== selectedCategory) {
      return false;
    }
    return true;
  });

  const onMedicineSubmit = (data: MedicineForm) => {
    const formData = {
      ...data,
      price: parseFloat(data.price).toString(),
    };
    
    if (editingMedicine) {
      medicineMutation.mutate({ ...formData, id: editingMedicine.id });
    } else {
      medicineMutation.mutate(formData);
    }
  };

  const onInventorySubmit = (data: InventoryForm) => {
    if (selectedMedicine) {
      addInventoryMutation.mutate({ ...data, medicineId: selectedMedicine.id });
    }
  };

  const openMedicineDialog = (medicine?: any) => {
    if (medicine) {
      setEditingMedicine(medicine);
      medicineForm.reset({
        name: medicine.name,
        description: medicine.description,
        dosage: medicine.dosage,
        price: medicine.price.toString(),
        categoryId: medicine.categoryId,
        manufacturer: medicine.manufacturer,
        requiresPrescription: medicine.requiresPrescription,
      });
    } else {
      setEditingMedicine(null);
      medicineForm.reset();
    }
    setShowMedicineDialog(true);
  };

  const openInventoryDialog = (medicine: any) => {
    setSelectedMedicine(medicine);
    inventoryForm.reset();
    setShowInventoryDialog(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { 
      label: "Out of Stock", 
      variant: "destructive" as const, 
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    };
    if (stock <= 10) return { 
      label: "Critical Low", 
      variant: "outline" as const, 
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    };
    if (stock <= 20) return { 
      label: "Low Stock", 
      variant: "secondary" as const, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
    return { 
      label: "Well Stocked", 
      variant: "default" as const, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Medicine Management</h1>
          <p className="text-muted-foreground">
            Manage your medicine inventory and catalog
          </p>
        </div>
        <Button onClick={() => openMedicineDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search medicines..."
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
                {(categories as any[]).map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medicines ({filteredMedicines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {medicinesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine: any) => {
                    const stockStatus = getStockStatus(medicine.totalStock);
                    return (
                      <TableRow key={medicine.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {medicine.dosage} | {medicine.manufacturer}
                            </div>
                            {medicine.requiresPrescription && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Schedule H
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {medicine.category?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{parseFloat(medicine.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${stockStatus.color}`}>
                            {medicine.totalStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openMedicineDialog(medicine)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openInventoryDialog(medicine)}
                            >
                              <Package2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{medicine.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMedicineMutation.mutate(medicine.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Medicine Dialog */}
      <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>
          <Form {...medicineForm}>
            <form onSubmit={medicineForm.handleSubmit(onMedicineSubmit)} className="space-y-4">
              <FormField
                control={medicineForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={medicineForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={medicineForm.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 500mg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicineForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={medicineForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categories as any[]).map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={medicineForm.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={medicineForm.control}
                name="requiresPrescription"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requires Prescription (Schedule H)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMedicineDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={medicineMutation.isPending}
                  className="flex-1"
                >
                  {medicineMutation.isPending ? "Saving..." : "Save Medicine"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Inventory - {selectedMedicine?.name}
            </DialogTitle>
          </DialogHeader>
          <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-4">
              <FormField
                control={inventoryForm.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inventoryForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inventoryForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInventoryDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addInventoryMutation.isPending}
                  className="flex-1"
                >
                  {addInventoryMutation.isPending ? "Adding..." : "Add Inventory"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
