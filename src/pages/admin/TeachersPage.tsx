import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TeacherDialog, TeachersTable } from './components';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { teachersService } from '@/services';
import { parseApiError } from '@/utils';
import type { TeacherDto } from '@/types';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDto | null>(null);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await teachersService.getAll();
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreate = () => {
    setSelectedTeacher(null);
    setDialogOpen(true);
  };

  const handleEdit = (teacher: TeacherDto) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = async (teacher: TeacherDto) => {
    if (!confirm(`Are you sure you want to delete ${teacher.prenom} ${teacher.nom}?`)) {
      return;
    }

    try {
      const response = await teachersService.delete(teacher.id);
      if (response.success) {
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    }
  };

  const handleDialogSuccess = () => {
    fetchTeachers();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teachers Management</h1>
            <p className="text-muted-foreground">Manage and view all teachers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTeachers} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <TeachersTable
                data={teachers}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={selectedTeacher}
        onSuccess={handleDialogSuccess}
      />
    </AdminLayout>
  );
};
