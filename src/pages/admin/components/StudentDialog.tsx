import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, Input, Label } from '@/components/ui';
import { toast } from 'react-toastify';
import { studentsService } from '@/services';
import { parseApiError } from '@/utils';
import type { StudentDto, CreateStudentDto, UpdateStudentDto } from '@/types';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDto | null;
  onSuccess: () => void;
}

export const StudentDialog = ({ open, onOpenChange, student, onSuccess }: StudentDialogProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cin: '',
    dateNaissance: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        cin: student.cin,
        dateNaissance: student.dateNaissance,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        cin: '',
        dateNaissance: '',
      });
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (student) {
        const updateData: UpdateStudentDto = formData;
        const response = await studentsService.update(student.id, updateData);
        if (response.success) {
          toast.success('Student updated successfully');
          onSuccess();
          onOpenChange(false);
        }
      } else {
        const createData: CreateStudentDto = formData;
        const response = await studentsService.create(createData);
        if (response.success) {
          toast.success('Student created successfully');
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Create Student'}</DialogTitle>
          <DialogDescription>
            {student ? 'Update student information' : 'Add a new student to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cin">CIN</Label>
              <Input
                id="cin"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                placeholder="AB123456"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateNaissance">Date of Birth</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : student ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
