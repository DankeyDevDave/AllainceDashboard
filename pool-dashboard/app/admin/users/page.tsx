import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground mt-2">
          Manage user accounts and permissions
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Multi-user management will be available in a future release. Currently, the system
          supports a single admin account configured via environment variables.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Active authentication setup</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Authentication Method</dt>
              <dd className="text-sm font-semibold mt-1">Credentials (Username/Password)</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Admin Account</dt>
              <dd className="text-sm font-semibold mt-1">Configured via ENV variables</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Session Duration</dt>
              <dd className="text-sm font-semibold mt-1">8 hours</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
          <CardDescription>What's coming in future versions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Multiple user accounts with role-based access control</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>User registration and password reset workflows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Granular permissions (view-only, operator, admin)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Activity logging and audit trails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Two-factor authentication support</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
