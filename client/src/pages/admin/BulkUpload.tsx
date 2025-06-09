import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  RefreshCw,
  Eye,
} from "lucide-react";

interface CSVRow {
  name: string;
  description: string;
  price: string;
  dosage: string;
  category: string;
  manufacturer: string;
  stock: string;
  batch: string;
  expiryDate: string;
  requiresPrescription: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ValidationError[];
}

export default function BulkUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get categories for validation
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/medicine-categories"],
  });

  // Parse CSV file
  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const expectedHeaders = [
      'name', 'description', 'price', 'dosage', 'category', 
      'manufacturer', 'stock', 'batch', 'expiryDate', 'requiresPrescription'
    ];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row as CSVRow);
      }
    }
    
    return data;
  };

  // Validate CSV data
  const validateCSVData = (data: CSVRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const categoryNames = categories.map((c: any) => c.name.toLowerCase());
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because index is 0-based and we skip header
      
      // Required fields validation
      if (!row.name?.trim()) {
        errors.push({ row: rowNum, field: 'name', message: 'Medicine name is required' });
      }
      
      if (!row.description?.trim()) {
        errors.push({ row: rowNum, field: 'description', message: 'Description is required' });
      }
      
      if (!row.price?.trim()) {
        errors.push({ row: rowNum, field: 'price', message: 'Price is required' });
      } else if (isNaN(parseFloat(row.price)) || parseFloat(row.price) <= 0) {
        errors.push({ row: rowNum, field: 'price', message: 'Price must be a valid positive number' });
      }
      
      if (!row.dosage?.trim()) {
        errors.push({ row: rowNum, field: 'dosage', message: 'Dosage is required' });
      }
      
      if (!row.category?.trim()) {
        errors.push({ row: rowNum, field: 'category', message: 'Category is required' });
      } else if (!categoryNames.includes(row.category.toLowerCase())) {
        errors.push({ row: rowNum, field: 'category', message: `Invalid category. Must be one of: ${categories.map((c: any) => c.name).join(', ')}` });
      }
      
      if (!row.manufacturer?.trim()) {
        errors.push({ row: rowNum, field: 'manufacturer', message: 'Manufacturer is required' });
      }
      
      if (!row.stock?.trim()) {
        errors.push({ row: rowNum, field: 'stock', message: 'Stock quantity is required' });
      } else if (isNaN(parseInt(row.stock)) || parseInt(row.stock) < 0) {
        errors.push({ row: rowNum, field: 'stock', message: 'Stock must be a valid non-negative number' });
      }
      
      if (!row.batch?.trim()) {
        errors.push({ row: rowNum, field: 'batch', message: 'Batch number is required' });
      }
      
      if (!row.expiryDate?.trim()) {
        errors.push({ row: rowNum, field: 'expiryDate', message: 'Expiry date is required' });
      } else if (isNaN(Date.parse(row.expiryDate))) {
        errors.push({ row: rowNum, field: 'expiryDate', message: 'Expiry date must be in valid date format (YYYY-MM-DD)' });
      }
      
      if (!row.requiresPrescription?.trim()) {
        errors.push({ row: rowNum, field: 'requiresPrescription', message: 'Prescription requirement is required' });
      } else if (!['true', 'false', '1', '0', 'yes', 'no'].includes(row.requiresPrescription.toLowerCase())) {
        errors.push({ row: rowNum, field: 'requiresPrescription', message: 'Prescription requirement must be true/false, 1/0, or yes/no' });
      }
    });
    
    return errors;
  };

  // Import medicines mutation
  const importMutation = useMutation({
    mutationFn: async (data: CSVRow[]) => {
      setIsProcessing(true);
      setUploadProgress(0);
      
      const results: ImportResult = { success: 0, failed: 0, errors: [] };
      
      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // Find category ID
          const category = categories.find((c: any) => 
            c.name.toLowerCase() === row.category.toLowerCase()
          );
          
          if (!category) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              field: 'category',
              message: `Category "${row.category}" not found`
            });
            continue;
          }
          
          // Convert requiresPrescription to boolean
          const requiresPrescription = ['true', '1', 'yes'].includes(row.requiresPrescription.toLowerCase());
          
          // Create medicine
          const medicineData = {
            name: row.name,
            description: row.description,
            dosage: row.dosage,
            price: parseFloat(row.price).toString(),
            categoryId: category.id,
            manufacturer: row.manufacturer,
            requiresPrescription,
          };
          
          const medicineResponse = await apiRequest("POST", "/api/admin/medicines", medicineData);
          const medicine = await medicineResponse.json();
          
          // Create inventory
          const inventoryData = {
            medicineId: medicine.id,
            batchNumber: row.batch,
            expiryDate: row.expiryDate,
            quantity: parseInt(row.stock),
          };
          
          await apiRequest("POST", "/api/admin/inventory", inventoryData);
          
          results.success++;
          
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            field: 'general',
            message: error.message || 'Failed to import medicine'
          });
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / data.length) * 100));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setImportResult(results);
      setIsProcessing(false);
      
      if (results.success > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${results.success} medicines. ${results.failed} failed.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      } else {
        toast({
          title: "Import Failed",
          description: "No medicines were imported. Please check the errors.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Parse CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          setCsvData(data);
          
          // Validate data
          const errors = validateCSVData(data);
          setValidationErrors(errors);
          
          setShowPreview(true);
        } catch (error: any) {
          toast({
            title: "CSV Parse Error",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const template = 'name,description,price,dosage,category,manufacturer,stock,batch,expiryDate,requiresPrescription';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicine-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setImportResult(null);
    setShowPreview(false);
    setIsProcessing(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const proceedWithImport = () => {
    if (validationErrors.length === 0 && csvData.length > 0) {
      importMutation.mutate(csvData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Medicine Upload</h1>
          <p className="text-muted-foreground">
            Import multiple medicines and inventory data via CSV file
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Instructions */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">CSV Upload Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Download the template CSV file to see the required format</li>
                <li>• Include all required columns: name, description, price, dosage, category, manufacturer, stock, batch, expiryDate, requiresPrescription</li>
                <li>• Category must match existing categories: {categories.map((c: any) => c.name).join(', ')}</li>
                <li>• Price should be a number (e.g., 45.50)</li>
                <li>• Stock should be a whole number</li>
                <li>• ExpiryDate should be in YYYY-MM-DD format</li>
                <li>• RequiresPrescription should be true/false, 1/0, or yes/no</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {!showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Upload your medicine CSV file</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop or click to select your CSV file
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported: CSV files (Max 5MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Validation */}
      {showPreview && !isProcessing && !importResult && (
        <div className="space-y-6">
          {/* File Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} records found
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={resetUpload} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  {validationErrors.length === 0 && (
                    <Button onClick={proceedWithImport} size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import {csvData.length} Records
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Found {validationErrors.length} validation error(s). Please fix these issues before importing:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm">
                        Row {error.row}, {error.field}: {error.message}
                      </p>
                    ))}
                    {validationErrors.length > 10 && (
                      <p className="text-sm">... and {validationErrors.length - 10} more errors</p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Data Preview
                {validationErrors.length === 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                )}
                {validationErrors.length > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {validationErrors.length} Errors
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Prescription</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 20).map((row, index) => {
                      const rowErrors = validationErrors.filter(e => e.row === index + 2);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>₹{row.price}</TableCell>
                          <TableCell>{row.stock}</TableCell>
                          <TableCell>{row.batch}</TableCell>
                          <TableCell>
                            <Badge variant={row.requiresPrescription.toLowerCase() === 'true' ? "destructive" : "default"}>
                              {row.requiresPrescription.toLowerCase() === 'true' ? 'Required' : 'Not Required'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rowErrors.length > 0 ? (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                {rowErrors.length} Error(s)
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Valid
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {csvData.length > 20 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Showing first 20 of {csvData.length} records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Importing Medicines...</h3>
                <p className="text-muted-foreground">
                  Please wait while we process your data
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadProgress}% Complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-sm text-green-700">Successfully Imported</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-red-700">Failed to Import</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Import Errors:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="font-medium">Row {error.row}:</span> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <Button onClick={resetUpload} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
