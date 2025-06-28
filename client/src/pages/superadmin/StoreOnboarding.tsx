import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, User, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const storeSchema = z.object({
  // Store Information
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Valid email is required"),
  storePhone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  gstNumber: z.string().optional(),
  
  // Admin User Information
  adminFirstName: z.string().min(1, "First name is required"),
  adminLastName: z.string().min(1, "Last name is required"),
  adminEmail: z.string().email("Valid email is required"),
  adminPhone: z.string().min(10, "Valid phone number is required"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function StoreOnboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: "",
      storeEmail: "",
      storePhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      licenseNumber: "",
      gstNumber: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",
      adminPassword: "",
    },
  });

  const onboardStoreMutation = useMutation({
    mutationFn: async (data: StoreFormData) => {
      return apiRequest("POST", "/api/superadmin/stores/onboard", data);
    },
    onSuccess: () => {
      toast({
        title: "Store Onboarded Successfully",
        description: "The medical store has been added to the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stores"] });
      navigate("/superadmin/stores");
    },
    onError: (error: any) => {
      toast({
        title: "Onboarding Failed",
        description: error.message || "Failed to onboard store. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StoreFormData) => {
    onboardStoreMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
        <div>
          <h1 className="text-3xl font-bold">Onboard New Medical Store</h1>
          <p className="text-gray-600">Add a new medical store to the platform</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <Building2 className="h-5 w-5" />
          </div>
          <div className={`h-1 w-20 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Store Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    placeholder="e.g., ABC Medical Store"
                    {...form.register("storeName")}
                  />
                  {form.formState.errors.storeName && (
                    <p className="text-sm text-red-600">{form.formState.errors.storeName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email *</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    placeholder="contact@abcmedical.com"
                    {...form.register("storeEmail")}
                  />
                  {form.formState.errors.storeEmail && (
                    <p className="text-sm text-red-600">{form.formState.errors.storeEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone *</Label>
                  <Input
                    id="storePhone"
                    placeholder="+91 9876543210"
                    {...form.register("storePhone")}
                  />
                  {form.formState.errors.storePhone && (
                    <p className="text-sm text-red-600">{form.formState.errors.storePhone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Drug License Number *</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="DL-12345-ABC"
                    {...form.register("licenseNumber")}
                  />
                  {form.formState.errors.licenseNumber && (
                    <p className="text-sm text-red-600">{form.formState.errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    placeholder="22AAAAA0000A1Z5"
                    {...form.register("gstNumber")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Street address, landmarks"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    {...form.register("state")}
                  />
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    {...form.register("pincode")}
                  />
                  {form.formState.errors.pincode && (
                    <p className="text-sm text-red-600">{form.formState.errors.pincode.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Next: Admin Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Admin User Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Store Administrator Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <Input
                    id="adminFirstName"
                    placeholder="John"
                    {...form.register("adminFirstName")}
                  />
                  {form.formState.errors.adminFirstName && (
                    <p className="text-sm text-red-600">{form.formState.errors.adminFirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    placeholder="Doe"
                    {...form.register("adminLastName")}
                  />
                  {form.formState.errors.adminLastName && (
                    <p className="text-sm text-red-600">{form.formState.errors.adminLastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@abcmedical.com"
                    {...form.register("adminEmail")}
                  />
                  {form.formState.errors.adminEmail && (
                    <p className="text-sm text-red-600">{form.formState.errors.adminEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Admin Phone *</Label>
                  <Input
                    id="adminPhone"
                    placeholder="+91 9876543210"
                    {...form.register("adminPhone")}
                  />
                  {form.formState.errors.adminPhone && (
                    <p className="text-sm text-red-600">{form.formState.errors.adminPhone.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adminPassword">Initial Password *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    {...form.register("adminPassword")}
                  />
                  {form.formState.errors.adminPassword && (
                    <p className="text-sm text-red-600">{form.formState.errors.adminPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={onboardStoreMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {onboardStoreMutation.isPending ? "Onboarding..." : "Complete Onboarding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}