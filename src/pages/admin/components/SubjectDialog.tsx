import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, Input, Label } from '@/components/ui';
import { toast } from 'react-toastify';
import { subjectsService } from '@/services';
import { parseApiError } from '@/utils';
import type { SubjectDto, CreateSubjectDto, UpdateSubjectDto } from '@/types';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectDto | null;
  onSuccess: () => void;
}

export const SubjectDialog = ({ open, onOpenChange, subject, onSuccess }: SubjectDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        isActive: subject.isActive,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        isActive: true,
      });
    }
  }, [subject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (subject) {
        const updateData: UpdateSubjectDto = formData;
        const response = await subjectsService.update(subject.id, updateData);
        if (response.success) {
          toast.success('Subject updated successfully');
          onSuccess();
          onOpenChange(false);
        }
      } else {
        const createData: CreateSubjectDto = formData;
        const response = await subjectsService.create(createData);
        if (response.success) {
          toast.success('Subject created successfully');
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
          <DialogTitle>{subject ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
          <DialogDescription>
            {subject ? 'Update subject information' : 'Add a new subject to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mathematics"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="MATH101"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Core mathematics subject"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : subject ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
