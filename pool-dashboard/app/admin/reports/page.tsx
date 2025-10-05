'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getCurrencyConfig } from '@/lib/currency-manager';
import { getCurrencyIcon } from '@/lib/currency-icons';
import type { ReportType, ReportParams } from '@/lib/types/admin';

export default function ReportsPage() {
  // Get dynamic currency icon
  const currencyConfig = getCurrencyConfig();
  const CurrencyIcon = getCurrencyIcon(currencyConfig.code);

  const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string; icon: any }> = [
    {
      value: 'energy',
      label: 'Energy Report',
      description: 'Daily/weekly/monthly consumption with trends',
      icon: Zap,
    },
    {
      value: 'cost',
      label: 'Cost Analysis',
      description: 'Breakdown by tariff period with charts',
      icon: CurrencyIcon,
    },
    {
      value: 'performance',
      label: 'Performance Report',
      description: 'COP trends and efficiency metrics',
      icon: TrendingUp,
    },
    {
      value: 'custom',
      label: 'Custom Report',
      description: 'User-defined metrics and date ranges',
      icon: FileText,
    },
  ];
  const [selectedType, setSelectedType] = useState<ReportType>('energy');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [interval, setInterval] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data for demonstration
      const mockData = {
        title: `${REPORT_TYPES.find(t => t.value === selectedType)?.label}`,
        period: { start: startDate, end: endDate },
        summary: {
          totalEnergy: 456.78,
          totalCost: 684.12,
          averageCop: 4.2,
          runtime: 123.5,
        },
        dataPoints: 50,
      };

      setReportData(mockData);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    setLoading(true);
    try {
      const { generatePDFReport } = await import('@/lib/reports/pdf-export');
      const doc = generatePDFReport(reportData);

      const fileName = `${selectedType}-report-${startDate}-to-${endDate}.pdf`;
      doc.save(fileName);

      toast.success(`PDF exported: ${fileName}`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      const { generateCSVReport } = await import('@/lib/reports/csv-export');
      generateCSVReport(reportData, `${selectedType}-report-${startDate}-to-${endDate}.csv`);

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    setLoading(true);
    try {
      const { generateExcelReport } = await import('@/lib/reports/excel-export');
      await generateExcelReport(reportData, `${selectedType}-report-${startDate}-to-${endDate}.xlsx`);

      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground mt-2">
          Generate and export energy, cost, and performance reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div>
        <Label className="text-base mb-3 block">Select Report Type</Label>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {REPORT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;

            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`rounded-lg p-3 ${isSelected ? 'bg-blue-500' : 'bg-muted'}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Report Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Configure date range and aggregation interval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aggregation Interval</Label>
            <div className="flex gap-2">
              {(['hourly', 'daily', 'weekly'] as const).map((int) => (
                <Button
                  key={int}
                  variant={interval === int ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInterval(int)}
                >
                  {int.charAt(0).toUpperCase() + int.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerateReport} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportData.title} • {reportData.period.start} to {reportData.period.end}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Energy</p>
                <p className="text-2xl font-bold">{reportData.summary.totalEnergy} kWh</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">R {reportData.summary.totalCost}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average COP</p>
                <p className="text-2xl font-bold">{reportData.summary.averageCop}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Runtime</p>
                <p className="text-2xl font-bold">{reportData.summary.runtime} hrs</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Report contains {reportData.dataPoints} data points. Export to view full details.
              </AlertDescription>
            </Alert>

            {/* Export Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportPDF} variant="default" className="flex-1" disabled={loading}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="flex-1" disabled={loading}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
