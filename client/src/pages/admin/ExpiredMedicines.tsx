import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Trash2, History, FileText, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ExpiredMedicines() {
  const [disposalDialogOpen, setDisposalDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [disposalReason, setDisposalReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expired batches
  const { data: expiredBatches = [], isLoading: expiredLoading } = useQuery({
    queryKey: ['/api/admin/expired-batches'],
  });

  // Fetch disposal history
  const { data: disposalHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/admin/disposal-history'],
  });

  // Dispose batch mutation
  const disposeBatchMutation = useMutation({
    mutationFn: async ({ batchId, reason }: { batchId: number; reason: string }) => {
      const response = await fetch(`/api/admin/batches/${batchId}/dispose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to dispose batch');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expired-batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disposal-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medicines'] });
      toast({ title: 'Success', description: 'Batch disposed successfully' });
      setDisposalDialogOpen(false);
      setSelectedBatch(null);
      setDisposalReason('');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleDispose = (batch: any) => {
    setSelectedBatch(batch);
    setDisposalDialogOpen(true);
  };

  const confirmDisposal = () => {
    if (!selectedBatch || !disposalReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a disposal reason', variant: 'destructive' });
      return;
    }
    
    disposeBatchMutation.mutate({
      batchId: selectedBatch.id,
      reason: disposalReason.trim(),
    });
  };

  const getDaysExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = today.getTime() - expiry.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalExpiredValue = () => {
    return expiredBatches.reduce((total: number, batch: any) => {
      const medicine = batch.medicine;
      const batchValue = batch.quantity * parseFloat(medicine.discountedPrice || medicine.mrp || '0');
      return total + batchValue;
    }, 0);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Expired Medicine Management</h1>
          <p className="text-muted-foreground">Manage expired batches and track disposal history</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Batches</p>
                <p className="text-2xl font-bold text-red-600">{expiredBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expired Units</p>
                <p className="text-2xl font-bold text-orange-600">
                  {expiredBatches.reduce((total: number, batch: any) => total + batch.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estimated Loss Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{calculateTotalExpiredValue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expired" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expired">Expired Batches</TabsTrigger>
          <TabsTrigger value="history">Disposal History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Expired Batches Requiring Action
              </CardTitle>
              <CardDescription>
                These batches have expired and need to be disposed of according to regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiredLoading ? (
                <p>Loading expired batches...</p>
              ) : expiredBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">No expired batches found</p>
                  <p className="text-sm text-gray-500">All inventory is within expiry dates</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Expired</TableHead>
                        <TableHead>Estimated Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiredBatches.map((batch: any) => (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{batch.medicine.name}</p>
                              <p className="text-sm text-gray-500">{batch.medicine.manufacturer}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{batch.batchNumber}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>{format(new Date(batch.expiryDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {getDaysExpired(batch.expiryDate)} days ago
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ₹{(batch.quantity * parseFloat(batch.medicine.discountedPrice || batch.medicine.mrp || '0')).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDispose(batch)}
                              disabled={disposeBatchMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Dispose
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Disposal History
              </CardTitle>
              <CardDescription>
                Complete record of all disposed medicine batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p>Loading disposal history...</p>
              ) : disposalHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">No disposal history</p>
                  <p className="text-sm text-gray-500">No batches have been disposed yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Disposal Date</TableHead>
                        <TableHead>Disposal Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disposalHistory.map((disposal: any) => (
                        <TableRow key={disposal.id}>
                          <TableCell className="font-medium">{disposal.medicineName}</TableCell>
                          <TableCell className="font-mono">{disposal.batchNumber}</TableCell>
                          <TableCell>{format(new Date(disposal.expiryDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(disposal.disposedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {disposal.disposalReason}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disposal Dialog */}
      <Dialog open={disposalDialogOpen} onOpenChange={setDisposalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Expired Batch</DialogTitle>
            <DialogDescription>
              Mark this batch as disposed and record the reason for regulatory compliance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Batch Details</h4>
                <div className="space-y-1 text-sm text-red-700">
                  <p><strong>Medicine:</strong> {selectedBatch.medicine.name}</p>
                  <p><strong>Batch Number:</strong> {selectedBatch.batchNumber}</p>
                  <p><strong>Quantity:</strong> {selectedBatch.quantity} units</p>
                  <p><strong>Expired:</strong> {format(new Date(selectedBatch.expiryDate), 'MMM dd, yyyy')} ({getDaysExpired(selectedBatch.expiryDate)} days ago)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disposalReason">Disposal Reason *</Label>
                <Textarea
                  id="disposalReason"
                  placeholder="Enter reason for disposal (e.g., Expired - Safe disposal as per regulations)"
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDisposalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDisposal}
                  disabled={disposeBatchMutation.isPending || !disposalReason.trim()}
                >
                  {disposeBatchMutation.isPending ? 'Disposing...' : 'Confirm Disposal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}