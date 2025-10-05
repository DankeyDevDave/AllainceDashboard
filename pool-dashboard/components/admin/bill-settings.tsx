'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  uploadBill,
  getBillHistory,
  deleteBill,
  compareBillWithCalculated,
} from '@/lib/bill-manager';
import { formatCurrency, getCurrencyConfig } from '@/lib/currency-manager';
import { formatDate } from '@/lib/date-formatter';
import type { BillData } from '@/lib/types/admin';
import { Upload, FileText, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

export function BillSettings() {
  const [bills, setBills] = useState<BillData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('manual');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    const history = getBillHistory();
    setBills(history);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const bill = await uploadBill(file, selectedProvider);
      toast.success(`Bill uploaded successfully: ${bill.fileName}`);
      loadBills();
      event.target.value = ''; // Reset input
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload bill');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (billId: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      deleteBill(billId);
      toast.success('Bill deleted successfully');
      loadBills();
    } catch (error) {
      toast.error('Failed to delete bill');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Bill Upload</CardTitle>
          </div>
          <CardDescription>
            Upload electricity bills in PDF or CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Bill Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Upload</SelectItem>
                <SelectItem value="eskom">Eskom</SelectItem>
                <SelectItem value="citypower">City Power</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billFile">Upload Bill File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="billFile"
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button disabled={uploading} type="button">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, CSV (max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bill History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Bill History</CardTitle>
          </div>
          <CardDescription>
            View and manage uploaded electricity bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No bills uploaded yet. Upload your first bill to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Energy Usage</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.fileName}</TableCell>
                      <TableCell>{bill.provider}</TableCell>
                      <TableCell>
                        {formatDate(bill.periodStart)} to {formatDate(bill.periodEnd)}
                      </TableCell>
                      <TableCell>{bill.energyUsage.toFixed(2)} kWh</TableCell>
                      <TableCell>
                        {formatCurrency(bill.totalCost, getCurrencyConfig())}
                      </TableCell>
                      <TableCell>
                        {formatDate(bill.uploadedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Bill Comparison (if we have system data) */}
      {bills.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Bill Analysis</CardTitle>
            </div>
            <CardDescription>
              Compare actual bills with calculated energy usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bill comparison with calculated usage requires integration with InfluxDB data.
                This feature will be available once you have sufficient historical data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
