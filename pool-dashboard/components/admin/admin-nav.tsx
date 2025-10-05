'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Coins,
  FileText,
  Users,
  Home,
} from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Tariff Config',
    href: '/admin/tariffs',
    icon: Coins,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: 'Soon',
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)]">
      <nav className="space-y-1 p-4">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="h-px bg-border my-4" />

        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Admin Menu
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
