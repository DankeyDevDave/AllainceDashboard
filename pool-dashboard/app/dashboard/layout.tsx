import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
