import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop, useScrollToTopOnMount } from "@/hooks/useScrollToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Plus,
  AlertTriangle,
  Camera,
} from "lucide-react";

export default function Prescriptions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { scrollToTop } = useScrollToTop();
  
  // Scroll to top on page load
  useScrollToTopOnMount();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Get prescriptions
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
  });

  // Upload prescription mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch("/api/prescriptions", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    },
    onSuccess: () => {
      toast({
        title: "Prescription Uploaded",
        description: "Your prescription has been uploaded successfully and is under review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      scrollToTop();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Camera can only capture JPG and PNG images.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please capture a smaller image (under 5MB).",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Upload and manage your medical prescriptions
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upload Prescription</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Upload File</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose from gallery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                {/* Camera Capture Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                     onClick={handleCameraCapture}>
                  <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Take Photo</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Capture with camera
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG only
                  </p>
                </div>
              </div>

              {/* Hidden file inputs */}
              <Input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="mb-4 sm:mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">
                Prescription Guidelines
              </h3>
              <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                <li>• Upload clear, readable images or PDF files of your prescription</li>
                <li>• Ensure all medicine names and dosages are visible</li>
                <li>• Prescriptions are reviewed by our licensed pharmacists</li>
                <li>• Approved prescriptions can be used for Schedule H medicine orders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('prescription.noPrescriptionsYet')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('prescription.uploadFirst')}
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t('prescription.uploadPrescription')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {prescriptions.map((prescription: any) => (
            <Card key={prescription.id} className="w-full">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{prescription.fileName}</h3>
                        <div className="flex">
                          <Badge className={`${getStatusColor(prescription.status)} inline-flex items-center w-fit`}>
                            {getStatusIcon(prescription.status)}
                            <span className="ml-1 capitalize">{prescription.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        
                        {prescription.reviewedAt && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              Reviewed: {new Date(prescription.reviewedAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {prescription.reviewNotes && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted rounded-lg">
                          <p className="text-xs sm:text-sm break-words">
                            <strong>Review Notes:</strong> {prescription.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {prescription.status === "pending" && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Under Review
                      </Badge>
                    )}
                    
                    {prescription.status === "approved" && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available for Orders
                      </Badge>
                    )}
                    
                    {prescription.status === "rejected" && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {prescriptions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Prescription Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {prescriptions.filter((p: any) => p.status === "approved").length}
                </div>
                <div className="text-sm text-green-700">Approved</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {prescriptions.filter((p: any) => p.status === "pending").length}
                </div>
                <div className="text-sm text-yellow-700">Under Review</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {prescriptions.filter((p: any) => p.status === "rejected").length}
                </div>
                <div className="text-sm text-red-700">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
