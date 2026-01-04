import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Plus, Loader2 } from 'lucide-react';
import { classesService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import { ClassDialog, ClassesTable } from './components';
import type { ClassDto } from '@/types';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await classesService.getAll();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch classes');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = () => {
    setSelectedClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (classItem: ClassDto) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  };

  const handleDelete = async (classItem: ClassDto) => {
    if (!window.confirm(`Are you sure you want to delete "${classItem.name}"?`)) {
      return;
    }

    try {
      await classesService.delete(classItem.id);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    }
  };

  const handleSuccess = () => {
    fetchClasses();
  };

  return (
     <AdminLayout>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Classes Management</h1>
                <p className="text-muted-foreground">
                    Manage your classes and their capacity
                </p>
                </div>
                <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
                </Button>
            </div>

            <Card>
                <CardHeader>
                <CardTitle>Classes List</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ClassesTable
                    data={classes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    />
                )}
                </CardContent>
            </Card>

            <ClassDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                classData={selectedClass}
                onSuccess={handleSuccess}
            />
        </div>
     </AdminLayout>
  );
};
