import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Download,
} from "lucide-react";

export default function PrescriptionReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Get pending prescriptions
  const { data: prescriptions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/prescriptions"],
  });

  // Update prescription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      apiRequest("PUT", `/api/admin/prescriptions/${id}`, { status, notes }),
    onSuccess: () => {
      toast({
        title: "Prescription Updated",
        description: "Prescription status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prescriptions"] });
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approvePrescription = (id: number, notes?: string) => {
    updateStatusMutation.mutate({ id, status: "approved", notes });
  };

  const rejectPrescription = (id: number, notes: string) => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    updateStatusMutation.mutate({ id, status: "rejected", notes });
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prescription Review</h1>
        <p className="text-muted-foreground">
          Review and approve customer prescription uploads
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {prescriptions.filter((p: any) => p.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-800">
                  {prescriptions.filter((p: any) => p.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-800">
                  {prescriptions.filter((p: any) => p.status === "rejected").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Reviews ({prescriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prescriptions to review</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription: any) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{prescription.fileName}</div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.fileSize ? (prescription.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prescription.user?.firstName} {prescription.user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prescription.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(prescription.uploadedAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(prescription.status)}>
                          {getStatusIcon(prescription.status)}
                          <span className="ml-1 capitalize">{prescription.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedPrescription(prescription)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Prescription Review</DialogTitle>
                              </DialogHeader>
                              
                              {selectedPrescription && (
                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Customer Information
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {selectedPrescription.user?.firstName} {selectedPrescription.user?.lastName}</p>
                                      <p><strong>Email:</strong> {selectedPrescription.user?.email}</p>
                                      <p><strong>Phone:</strong> {selectedPrescription.user?.phone}</p>
                                    </CardContent>
                                  </Card>

                                  {/* Prescription Details */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Prescription Details
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                      <p><strong>File Name:</strong> {selectedPrescription.fileName}</p>
                                      <p><strong>Upload Date:</strong> {new Date(selectedPrescription.uploadedAt).toLocaleDateString("en-IN")}</p>
                                      <p><strong>Status:</strong> 
                                        <Badge className={`ml-2 ${getStatusColor(selectedPrescription.status)}`}>
                                          {selectedPrescription.status}
                                        </Badge>
                                      </p>
                                      {selectedPrescription.reviewNotes && (
                                        <div>
                                          <strong>Review Notes:</strong>
                                          <p className="mt-1 p-2 bg-muted rounded">{selectedPrescription.reviewNotes}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Prescription Image */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Prescription Image
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                          <img
                                            src={`/uploads/${selectedPrescription.fileName}`}
                                            alt="Prescription"
                                            className="w-full max-w-lg mx-auto rounded-lg shadow-sm"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                              if (nextElement) {
                                                nextElement.style.display = 'block';
                                              }
                                            }}
                                          />
                                          <div className="text-center py-8 text-muted-foreground" style={{display: 'none'}}>
                                            <FileText className="h-12 w-12 mx-auto mb-2" />
                                            <p>Image not available</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="outline" size="sm" asChild>
                                            <a 
                                              href={`/uploads/${selectedPrescription.fileName}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2"
                                            >
                                              <Eye className="h-4 w-4" />
                                              View Full Size
                                            </a>
                                          </Button>
                                          <Button variant="outline" size="sm" asChild>
                                            <a 
                                              href={`/uploads/${selectedPrescription.fileName}`} 
                                              download={selectedPrescription.fileName}
                                              className="flex items-center gap-2"
                                            >
                                              <Download className="h-4 w-4" />
                                              Download
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Review Actions */}
                                  {selectedPrescription.status === "pending" && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Review Notes (Optional)</label>
                                        <Textarea
                                          placeholder="Add any notes about this prescription review..."
                                          value={reviewNotes}
                                          onChange={(e) => setReviewNotes(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => approvePrescription(selectedPrescription.id, reviewNotes)}
                                          disabled={updateStatusMutation.isPending}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="destructive"
                                              disabled={updateStatusMutation.isPending}
                                              className="flex-1"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Reject Prescription</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to reject this prescription? Please provide a reason in the notes above.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => rejectPrescription(selectedPrescription.id, reviewNotes)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Reject
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {prescription.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approvePrescription(prescription.id)}
                                disabled={updateStatusMutation.isPending}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={updateStatusMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Prescription</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Please provide a reason for rejecting this prescription.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    placeholder="Reason for rejection..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => rejectPrescription(prescription.id, reviewNotes)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
