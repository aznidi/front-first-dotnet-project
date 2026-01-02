import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SubjectDialog, SubjectsTable } from './components';
import { Card, CardContent, Button } from '@/components/ui';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { subjectsService } from '@/services';
import { parseApiError } from '@/utils';
import type { SubjectDto } from '@/types';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await subjectsService.getAll();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = () => {
    setSelectedSubject(null);
    setDialogOpen(true);
  };

  const handleEdit = (subject: SubjectDto) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  const handleDelete = async (subject: SubjectDto) => {
    if (!confirm(`Are you sure you want to delete ${subject.name}?`)) {
      return;
    }

    try {
      const response = await subjectsService.delete(subject.id);
      if (response.success) {
        toast.success('Subject deleted successfully');
        fetchSubjects();
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    }
  };

  const handleDialogSuccess = () => {
    fetchSubjects();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subjects Management</h1>
            <p className="text-muted-foreground">Manage and view all subjects</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSubjects} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
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
              <SubjectsTable
                data={subjects}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={selectedSubject}
        onSuccess={handleDialogSuccess}
      />
    </AdminLayout>
  );
};
