import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, Input, Label } from '@/components/ui';
import { toast } from 'react-toastify';
import { teachersService } from '@/services';
import { parseApiError } from '@/utils';
import type { TeacherDto, CreateTeacherDto, UpdateTeacherDto } from '@/types';

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherDto | null;
  onSuccess: () => void;
}

export const TeacherDialog = ({ open, onOpenChange, teacher, onSuccess }: TeacherDialogProps) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    dateNaissance: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        nom: teacher.nom,
        prenom: teacher.prenom,
        cin: teacher.cin,
        dateNaissance: teacher.dateNaissance,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        cin: '',
        dateNaissance: '',
      });
    }
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (teacher) {
        const updateData: UpdateTeacherDto = formData;
        const response = await teachersService.update(teacher.id, updateData);
        if (response.success) {
          toast.success('Teacher updated successfully');
          onSuccess();
          onOpenChange(false);
        }
      } else {
        const createData: CreateTeacherDto = formData;
        const response = await teachersService.create(createData);
        if (response.success) {
          toast.success('Teacher created successfully');
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
          <DialogTitle>{teacher ? 'Edit Teacher' : 'Create Teacher'}</DialogTitle>
          <DialogDescription>
            {teacher ? 'Update teacher information' : 'Add a new teacher to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prenom">First Name (Prénom)</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Ahmed"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nom">Last Name (Nom)</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Benali"
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
              {isLoading ? 'Saving...' : teacher ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
