import { AdminLayout } from '@/components/layout/AdminLayout';

export const AdminDashboard = () => {

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin panel</p>
        </div>

      
      </div>
    </AdminLayout>
  );
};
