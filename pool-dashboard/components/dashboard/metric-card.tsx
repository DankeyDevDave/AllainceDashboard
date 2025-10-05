import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  threshold?: {
    green: number;
    yellow: number;
    red?: number;
  };
  className?: string;
  subtitle?: string;
  lastUpdated?: Date | null;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  threshold,
  className,
  subtitle,
  lastUpdated,
}: MetricCardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  
  const getColorClasses = () => {
    if (!threshold || isNaN(numValue)) return 'text-foreground';
    
    if (threshold.red !== undefined) {
      // Reverse threshold (higher is worse)
      if (numValue >= threshold.red) return 'text-red-600 dark:text-red-400';
      if (numValue >= threshold.yellow) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-green-600 dark:text-green-400';
    } else {
      // Normal threshold (higher is better)
      if (numValue >= threshold.green) return 'text-green-600 dark:text-green-400';
      if (numValue >= threshold.yellow) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusBadge = () => {
    if (!threshold || isNaN(numValue)) return null;
    
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    let status = 'Normal';
    
    if (threshold.red !== undefined) {
      if (numValue >= threshold.red) {
        variant = 'destructive';
        status = 'High';
      } else if (numValue >= threshold.yellow) {
        variant = 'secondary';
        status = 'Moderate';
      } else {
        variant = 'default';
        status = 'Good';
      }
    } else {
      if (numValue >= threshold.green) {
        variant = 'default';
        status = 'Excellent';
      } else if (numValue >= threshold.yellow) {
        variant = 'secondary';
        status = 'Normal';
      } else {
        variant = 'destructive';
        status = 'Low';
      }
    }
    
    return <Badge variant={variant} className="text-xs">{status}</Badge>;
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex-grow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className={cn('text-2xl font-bold', getColorClasses())}>
              {typeof value === 'number' ? value.toFixed(2) : value}
              {unit && <span className="text-sm ml-1 text-muted-foreground">{unit}</span>}
            </div>
            {getStatusBadge()}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center text-xs mt-2">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          )}
        </CardContent>
      </div>
      {lastUpdated && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
