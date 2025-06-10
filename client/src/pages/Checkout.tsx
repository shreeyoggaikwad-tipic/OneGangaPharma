import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  CreditCard,
  MapPin,
  Upload,
  FileText,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Check,
} from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Valid postal code is required"),
  type: z.enum(["billing", "shipping"]),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<number | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<number | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
  const [uploadedPrescription, setUploadedPrescription] = useState<any>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressType, setAddressType] = useState<"billing" | "shipping">("billing");
  const [showUploadPrescription, setShowUploadPrescription] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get cart items
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  // Get addresses
  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
  });

  // Get prescriptions
  const { data: prescriptions = [] } = useQuery<any[]>({
    queryKey: ["/api/prescriptions"],
  });

  // Address form
  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      type: "billing",
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: (data: AddressForm) => apiRequest("POST", "/api/addresses", data),
    onSuccess: () => {
      toast({
        title: "Address Added",
        description: "Address has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setShowAddressDialog(false);
      addressForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload prescription mutation
  const uploadPrescriptionMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch("/api/prescriptions", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setUploadedPrescription(result);
      setSelectedPrescription(null); // Clear existing selection
      toast({
        title: "Prescription Uploaded",
        description: "Your prescription has been uploaded and will be reviewed with your order.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders", orderData),
    onSuccess: (response: any) => {
      const order = response.json ? response.json() : response;
      const hasScheduleH = hasScheduleHMedicines;
      
      // Invalidate cart and orders cache to refresh data immediately
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      
      if (hasScheduleH) {
        toast({
          title: "Order Placed - Pending Review",
          description: "Your order has been placed and is awaiting prescription review. You'll be notified once approved.",
        });
      } else {
        toast({
          title: "Order Confirmed",
          description: "Your order has been confirmed and will be processed shortly!",
        });
      }
      
      // Add small delay to ensure cache invalidation completes before navigation
      setTimeout(() => {
        setLocation(`/orders`);
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + parseFloat(item.medicine.price) * item.quantity,
    0
  );

  const hasScheduleHMedicines = cartItems.some((item: any) => item.medicine.requiresPrescription);
  const approvedPrescriptions = prescriptions.filter((p: any) => p.status === "approved");

  // Auto-select default addresses
  useEffect(() => {
    const defaultBilling = addresses.find((addr: any) => addr.type === "billing" && addr.isDefault);
    const defaultShipping = addresses.find((addr: any) => addr.type === "shipping" && addr.isDefault);
    
    if (defaultBilling) setSelectedBillingAddress(defaultBilling.id);
    if (defaultShipping) setSelectedShippingAddress(defaultShipping.id);
  }, [addresses]);

  // Handle same as billing address
  useEffect(() => {
    if (sameAsBilling && selectedBillingAddress) {
      setSelectedShippingAddress(selectedBillingAddress);
    }
  }, [sameAsBilling, selectedBillingAddress]);

  const onAddressSubmit = (data: AddressForm) => {
    addAddressMutation.mutate({ ...data, type: addressType });
  };

  const handlePlaceOrder = () => {
    if (!selectedBillingAddress || !selectedShippingAddress) {
      toast({
        title: "Missing Address",
        description: "Please select both billing and shipping addresses.",
        variant: "destructive",
      });
      return;
    }

    // For Schedule H medicines, prescription is required but order can be placed pending review
    if (hasScheduleHMedicines && !selectedPrescription && !uploadedPrescription) {
      toast({
        title: "Prescription Required",
        description: "Please upload or select a prescription for Schedule H medicines.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: cartItems.map((item: any) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.medicine.price,
        totalPrice: parseFloat(item.medicine.price) * item.quantity,
      })),
      billingAddressId: selectedBillingAddress,
      shippingAddressId: selectedShippingAddress,
      prescriptionId: selectedPrescription || uploadedPrescription?.id,
      totalAmount: subtotal,
      hasScheduleH: hasScheduleHMedicines,
    };

    createOrderMutation.mutate(orderData);
  };

  const openAddressDialog = (type: "billing" | "shipping") => {
    setAddressType(type);
    addressForm.setValue("type", type);
    setShowAddressDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload JPG, PNG, or PDF files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadPrescription = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    uploadPrescriptionMutation.mutate(selectedFile);
  };

  const clearUploadedPrescription = () => {
    setUploadedPrescription(null);
    setSelectedFile(null);
    setShowUploadPrescription(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some medicines to proceed with checkout
            </p>
            <Button onClick={() => setLocation("/medicines")}>
              Browse Medicines
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.filter((addr: any) => addr.type === "billing").map((address: any) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBillingAddress === address.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedBillingAddress(address.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                    {selectedBillingAddress === address.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => openAddressDialog("billing")}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Billing Address
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onCheckedChange={(checked) => setSameAsBilling(checked === true)}
                />
                <Label htmlFor="sameAsBilling">Same as billing address</Label>
              </div>

              {!sameAsBilling && (
                <>
                  {addresses.filter((addr: any) => addr.type === "shipping").map((address: any) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedShippingAddress === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedShippingAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                        </div>
                        {selectedShippingAddress === address.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => openAddressDialog("shipping")}
                    className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Shipping Address
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Prescription Selection */}
          {hasScheduleHMedicines && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">Schedule H Medicines Detected</p>
                      <p className="text-sm text-orange-700">
                        Your cart contains medicines that require a prescription. Please select an approved prescription.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Existing Approved Prescriptions */}
                  {approvedPrescriptions.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Previously Approved Prescriptions:</p>
                      {approvedPrescriptions.map((prescription: any) => (
                        <div
                          key={prescription.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPrescription === prescription.id && !uploadedPrescription
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            setSelectedPrescription(prescription.id);
                            clearUploadedPrescription();
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{prescription.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()}
                              </p>
                              <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                                Approved
                              </Badge>
                            </div>
                            {selectedPrescription === prescription.id && !uploadedPrescription && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload New Prescription */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {approvedPrescriptions.length > 0 ? "Or Upload New Prescription:" : "Upload Prescription:"}
                      </p>
                      {!showUploadPrescription && !uploadedPrescription && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowUploadPrescription(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload New
                        </Button>
                      )}
                    </div>

                    {/* Show uploaded prescription if exists */}
                    {uploadedPrescription && (
                      <div className="p-4 border border-primary rounded-lg bg-primary/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{uploadedPrescription.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              Just uploaded - pending review
                            </p>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 mt-1">
                              Pending Review
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearUploadedPrescription}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload form */}
                    {showUploadPrescription && !uploadedPrescription && (
                      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                        <div className="space-y-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium">Upload Prescription</p>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG, or PDF files up to 10MB
                            </p>
                          </div>
                          
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileSelect}
                            className="w-full"
                          />
                          
                          {selectedFile && (
                            <div className="text-sm text-muted-foreground">
                              Selected: {selectedFile.name}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUploadPrescription}
                              disabled={!selectedFile || uploadPrescriptionMutation.isPending}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              {uploadPrescriptionMutation.isPending ? "Uploading..." : "Upload"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowUploadPrescription(false);
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No prescription option */}
                    {approvedPrescriptions.length === 0 && !showUploadPrescription && !uploadedPrescription && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> You can place this order now and upload your prescription afterward. 
                          The order will be processed once your prescription is reviewed and approved by our pharmacist.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">COD</span>
                </div>
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Pay when your order is delivered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.medicine.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ₹{(parseFloat(item.medicine.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg py-6"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add {addressType === "billing" ? "Billing" : "Shipping"} Address
            </DialogTitle>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
              <FormField
                control={addressForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addressForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddressDialog(false)}
                  className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addAddressMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {addAddressMutation.isPending ? "Adding..." : "Add Address"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
