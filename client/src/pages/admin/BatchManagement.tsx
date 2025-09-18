import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Package, AlertTriangle, Edit, Trash2, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('expiryDate');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch medicines for selection
  // const { data: medicines = [] } = useQuery({
  //   queryKey: ['/api/medicines'],
  // });
const { user } = useAuth();
const storeId = user?.storeId;

const { data: medicines = [] } = useQuery({
  queryKey: ['/api/medicines', { storeId }],  // 👈 include storeId in key
  queryFn: async ({ queryKey }) => {
    const [_key, { storeId }] = queryKey as [string, { storeId: number }];

    const params = new URLSearchParams();
    if (storeId) {
      params.append("storeId", storeId.toString()); // ✅ add storeId
    }

    const response = await fetch(`/api/medicines?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch medicines");
    }
    return response.json();
  },
  enabled: !!storeId, // ✅ only run when storeId is available
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

  const getBatchStatus = (expiryDate: string) => {
    if (isExpired(expiryDate)) return 'expired';
    if (isExpiringSoon(expiryDate)) return 'expiring';
    return 'active';
  };

  const filteredBatches = batches
    .filter((batch: any) => {
      const matchesSearch = batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || getBatchStatus(batch.expiryDate) === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'expiryDate') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      }
      if (sortBy === 'batchNumber') {
        return a.batchNumber.localeCompare(b.batchNumber);
      }
      return 0;
    });

  const getBatchStats = () => {
    if (!batches.length) return { total: 0, active: 0, expiring: 0, expired: 0, totalValue: 0 };
    
    const stats = batches.reduce((acc: any, batch: any) => {
      const status = getBatchStatus(batch.expiryDate);
      acc[status]++;
      acc.total++;
      
      // Calculate batch value (assuming we have medicine data)
      const medicine = medicines.find((m: any) => m.id === batch.medicineId);
      if (medicine) {
        const batchValue = batch.quantity * parseFloat(medicine.discountedPrice || medicine.mrp || '0');
        acc.totalValue += batchValue;
      }
      
      return acc;
    }, { total: 0, active: 0, expiring: 0, expired: 0, totalValue: 0 });
    
    return stats;
  };

  const generateBatchReport = () => {
    const medicine = medicines.find((m: any) => m.id === selectedMedicineId);
    if (!medicine || !batches.length) return;

    const csvContent = [
      ['Batch Number', 'Quantity', 'Expiry Date', 'Status', 'Days to Expiry', 'Estimated Value'],
      ...batches.map((batch: any) => [
        batch.batchNumber,
        batch.quantity,
        format(new Date(batch.expiryDate), 'yyyy-MM-dd'),
        getBatchStatus(batch.expiryDate),
        isExpired(batch.expiryDate) 
          ? -Math.ceil((new Date().getTime() - new Date(batch.expiryDate).getTime()) / (1000 * 60 * 60 * 24))
          : Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        (batch.quantity * parseFloat(medicine.discountedPrice || medicine.mrp || '0')).toFixed(2)
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-report-${medicine.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="space-y-6">
          {/* Batch Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Batches</p>
                    <p className="text-2xl font-bold text-blue-600">{getBatchStats().total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Batches</p>
                    <p className="text-2xl font-bold text-green-600">{getBatchStats().active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">{getBatchStats().expiring}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-red-600">{getBatchStats().expired}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Batch Management</CardTitle>
                  <CardDescription>Manage inventory batches for selected medicine</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateBatchReport} disabled={!batches.length}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
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
              </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search batch numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiryDate">Expiry Date</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="batchNumber">Batch Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {batchesLoading ? (
              <p>Loading batches...</p>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">
                  {batches.length === 0 ? 'No batches found for this medicine' : 'No batches match your filters'}
                </p>
                <p className="text-sm text-gray-500">
                  {batches.length === 0 ? 'Add the first batch to get started' : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Until Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Estimated Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch: any) => {
                      const medicine = medicines.find((m: any) => m.id === batch.medicineId);
                      const batchValue = medicine ? batch.quantity * parseFloat(medicine.discountedPrice || medicine.mrp || '0') : 0;
                      const daysUntilExpiry = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium font-mono">{batch.batchNumber}</TableCell>
                          <TableCell>
                            <span className="font-medium">{batch.quantity}</span>
                            <span className="text-sm text-gray-500 ml-1">units</span>
                          </TableCell>
                          <TableCell>{format(new Date(batch.expiryDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              daysUntilExpiry < 0 ? 'text-red-600' : 
                              daysUntilExpiry <= 30 ? 'text-orange-600' : 
                              'text-green-600'
                            }`}>
                              {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days`}
                            </span>
                          </TableCell>
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
                            <span className="font-medium">₹{batchValue.toLocaleString()}</span>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Batch Summary */}
            {filteredBatches.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Showing:</span>
                    <span className="font-medium ml-1">{filteredBatches.length} batches</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Units:</span>
                    <span className="font-medium ml-1">
                      {filteredBatches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium ml-1">
                      ₹{filteredBatches.reduce((sum: number, batch: any) => {
                        const medicine = medicines.find((m: any) => m.id === batch.medicineId);
                        return sum + (medicine ? batch.quantity * parseFloat(medicine.discountedPrice || medicine.mrp || '0') : 0);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Days to Expiry:</span>
                    <span className="font-medium ml-1">
                      {Math.round(
                        filteredBatches.reduce((sum: number, batch: any) => {
                          const days = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return sum + Math.max(0, days);
                        }, 0) / filteredBatches.length
                      )} days
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}