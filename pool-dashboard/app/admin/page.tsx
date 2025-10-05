import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  Coins,
  FileText,
  TrendingUp,
  Database,
  Shield,
  ChevronRight
} from 'lucide-react';

const quickActions = [
  {
    title: 'Manage Settings',
    description: 'Configure dashboard preferences and thresholds',
    href: '/admin/settings',
    icon: Settings,
    color: 'text-blue-500',
  },
  {
    title: 'Configure Tariffs',
    description: 'Set up electricity pricing and schedules',
    href: '/admin/tariffs',
    icon: Coins,
    color: 'text-green-500',
  },
  {
    title: 'Generate Reports',
    description: 'Create and export energy & performance reports',
    href: '/admin/reports',
    icon: FileText,
    color: 'text-purple-500',
  },
];

const stats = [
  {
    title: 'Active Settings',
    value: '12',
    description: 'Configuration items',
    icon: Database,
  },
  {
    title: 'Tariff Periods',
    value: '3',
    description: 'Peak, Standard, Off-Peak',
    icon: TrendingUp,
  },
  {
    title: 'Security Status',
    value: 'Secure',
    description: 'Admin authentication enabled',
    icon: Shield,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to the AquaTemp administration panel
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-muted p-2 ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href={action.href}>
                      Open
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Platform</dt>
              <dd className="text-sm font-semibold mt-1">AquaTemp v3.1.0</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Dashboard Version</dt>
              <dd className="text-sm font-semibold mt-1">Next.js 15.5</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Data Source</dt>
              <dd className="text-sm font-semibold mt-1">InfluxDB 2.x</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Authentication</dt>
              <dd className="text-sm font-semibold mt-1">NextAuth.js</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
