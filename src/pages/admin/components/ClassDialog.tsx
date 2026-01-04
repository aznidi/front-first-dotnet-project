import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button, Input, Label } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { classesService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import type { ClassDto, CreateClassDto, UpdateClassDto } from '@/types';

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: ClassDto | null;
  onSuccess: () => void;
}

export const ClassDialog = ({
  open,
  onOpenChange,
  classData,
  onSuccess,
}: ClassDialogProps) => {
  const [formData, setFormData] = useState<CreateClassDto | UpdateClassDto>({
    name: '',
    description: '',
    capacity: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        description: classData.description || '',
        capacity: classData.capacity,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: 30,
      });
    }
  }, [classData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (classData) {
        const response = await classesService.update(classData.id, formData);
        if (response.success) {
          toast.success('Class updated successfully');
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(response.message || 'Failed to update class');
        }
      } else {
        const response = await classesService.create(formData);
        if (response.success) {
          toast.success('Class created successfully');
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(response.message || 'Failed to create class');
        }
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error(parsedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{classData ? 'Edit Class' : 'Create Class'}</DialogTitle>
            <DialogDescription>
              {classData
                ? 'Update the class information below.'
                : 'Add a new class to the system.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Class A"
                maxLength={100}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Class description (optional)"
                maxLength={500}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                }
                min={1}
                max={1000}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be between 1 and 1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {classData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{classData ? 'Update' : 'Create'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
