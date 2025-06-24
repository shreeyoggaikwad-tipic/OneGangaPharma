import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Package, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const batchSchema = z.object({
  medicineId: z.number(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function BatchManagement() {
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch medicines for selection
  const { data: medicines = [] } = useQuery({
    queryKey: ['/api/medicines'],
  });

  // Fetch batches for selected medicine
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['/api/admin/batches', selectedMedicineId],
    enabled: !!selectedMedicineId,
  });

  // Fetch expiring batches
  const { data: expiringBatches = [] } = useQuery({
    queryKey: ['/api/admin/expiring-batches'],
    queryFn: () => fetch('/api/admin/expiring-batches?days=30').then(res => res.json()),
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      medicineId: selectedMedicineId || 0,
      batchNumber: '',
      quantity: 1,
      expiryDate: '',
    },
  });

  // Add batch mutation
  const addBatchMutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      const response = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add batch');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expiring-batches'] });
      toast({ title: 'Success', description: 'Batch added successfully' });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add batch', variant: 'destructive' });
    },
  });

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BatchFormData> }) => {
      const response = await fetch(`/api/admin/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update batch');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expiring-batches'] });
      toast({ title: 'Success', description: 'Batch updated successfully' });
      setEditingBatch(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update batch', variant: 'destructive' });
    },
  });

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/batches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete batch');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expiring-batches'] });
      toast({ title: 'Success', description: 'Batch deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete batch', variant: 'destructive' });
    },
  });

  const onSubmit = (data: BatchFormData) => {
    if (editingBatch) {
      updateBatchMutation.mutate({ id: editingBatch.id, data });
    } else {
      addBatchMutation.mutate(data);
    }
  };

  const handleEdit = (batch: any) => {
    setEditingBatch(batch);
    form.reset({
      medicineId: batch.medicineId,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      expiryDate: format(new Date(batch.expiryDate), 'yyyy-MM-dd'),
    });
    setIsAddDialogOpen(true);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground">Manage medicine inventory batches and track expiry dates</p>
        </div>
      </div>

      {/* Expiring Batches Alert */}
      {expiringBatches.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Expiring Batches Alert
            </CardTitle>
            <CardDescription className="text-orange-600">
              {expiringBatches.length} batch(es) expiring within 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringBatches.slice(0, 3).map((batch: any) => (
                <div key={batch.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{batch.medicine.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">Batch: {batch.batchNumber}</span>
                  </div>
                  <Badge variant="destructive">
                    Expires: {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}
                  </Badge>
                </div>
              ))}
              {expiringBatches.length > 3 && (
                <p className="text-sm text-orange-600">+{expiringBatches.length - 3} more expiring batches</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Medicine
          </CardTitle>
          <CardDescription>Choose a medicine to view and manage its batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMedicineId?.toString() || ''} onValueChange={(value) => setSelectedMedicineId(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a medicine" />
            </SelectTrigger>
            <SelectContent>
              {medicines.map((medicine: any) => (
                <SelectItem key={medicine.id} value={medicine.id.toString()}>
                  {medicine.name} - {medicine.manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Batch Management */}
      {selectedMedicineId && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Batches</CardTitle>
                <CardDescription>Manage inventory batches for selected medicine</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingBatch(null);
                    form.reset({
                      medicineId: selectedMedicineId,
                      batchNumber: '',
                      quantity: 1,
                      expiryDate: '',
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
                    <DialogDescription>
                      {editingBatch ? 'Update batch information' : 'Add a new inventory batch for this medicine'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter batch number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                placeholder="Enter quantity" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={format(new Date(), 'yyyy-MM-dd')}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Expiry date must be today or in the future
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addBatchMutation.isPending || updateBatchMutation.isPending}>
                          {editingBatch ? 'Update' : 'Add'} Batch
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {batchesLoading ? (
              <p>Loading batches...</p>
            ) : batches.length === 0 ? (
              <p className="text-muted-foreground">No batches found for this medicine.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch: any) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.quantity}</TableCell>
                        <TableCell>{format(new Date(batch.expiryDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {isExpired(batch.expiryDate) ? (
                            <Badge variant="destructive" className="bg-red-600">Expired</Badge>
                          ) : isExpiringSoon(batch.expiryDate) ? (
                            <Badge variant="destructive">Expiring Soon</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(batch)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteBatchMutation.mutate(batch.id)}
                              disabled={deleteBatchMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      )}
    </div>
  );
}