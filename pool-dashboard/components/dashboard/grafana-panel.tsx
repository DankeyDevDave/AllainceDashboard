'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface GrafanaPanelProps {
  dashboardUid: string;
  panelId: number;
  from?: string;
  to?: string;
  vars?: Record<string, string>;
  height?: number;
  theme?: 'light' | 'dark';
  refresh?: string;
}

export function GrafanaPanel({
  dashboardUid,
  panelId,
  from = 'now-24h',
  to = 'now',
  vars = {},
  height = 400,
  theme = 'light',
  refresh = '30s',
}: GrafanaPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const grafanaUrl = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://192.168.0.6:3000';
  
  // Build variable string
  const varString = Object.entries(vars)
    .map(([key, value]) => `var-${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  // Build full embed URL
  const embedUrl = `${grafanaUrl}/d-solo/${dashboardUid}?` +
    `orgId=1&` +
    `from=${from}&` +
    `to=${to}&` +
    `panelId=${panelId}&` +
    `theme=${theme}&` +
    `refresh=${refresh}&` +
    `kiosk` +
    (varString ? `&${varString}` : '');

  return (
    <div className="relative w-full rounded-lg overflow-hidden border" style={{ height }}>
      {loading && (
        <Skeleton className="absolute inset-0" />
      )}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <iframe
        src={embedUrl}
        title={`Grafana Panel ${panelId}`}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('Failed to load Grafana panel. Check connection settings.');
        }}
      />
    </div>
  );
}
