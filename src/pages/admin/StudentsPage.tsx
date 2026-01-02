import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StudentDialog, StudentsTable } from './components';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { studentsService } from '@/services';
import { parseApiError } from '@/utils';
import type { StudentDto } from '@/types';

export const StudentsPage = () => {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentsService.getAll();
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreate = () => {
    setSelectedStudent(null);
    setDialogOpen(true);
  };

  const handleEdit = (student: StudentDto) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = async (student: StudentDto) => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      return;
    }

    try {
      const response = await studentsService.delete(student.id);
      if (response.success) {
        toast.success('Student deleted successfully');
        fetchStudents();
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    }
  };

  const handleDialogSuccess = () => {
    fetchStudents();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students Management</h1>
            <p className="text-muted-foreground">Manage and view all students</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
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
              <StudentsTable
                data={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={selectedStudent}
        onSuccess={handleDialogSuccess}
      />
    </AdminLayout>
  );
};
