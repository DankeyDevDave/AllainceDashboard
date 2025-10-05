'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Waves } from 'lucide-react';
import type { Session } from 'next-auth';

interface AdminHeaderProps {
  user: Session['user'];
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/dashboard' });
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500 p-2">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AquaTemp Admin</h1>
            <p className="text-xs text-muted-foreground">System Administration Panel</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user?.name || 'Admin'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
