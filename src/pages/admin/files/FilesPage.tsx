import { useState, useEffect } from 'react';
import { FileIcon } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { filesService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import type { StoredFileDto } from '@/types';

export const FilesPage = () => {
  const [files, setFiles] = useState<StoredFileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await filesService.listFiles();
      if (response.success && response.data) {
        setFiles(response.data);
      } else {
        toast.error(response.message || 'Failed to load files');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error('Failed to load files: ' + parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <FileIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">File Manager</h1>
            <p className="text-muted-foreground">Upload and manage your files</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Upload File</h2>
            <FileUpload onUploadSuccess={loadFiles} />
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">My Files</h2>
            <FileList files={files} isLoading={isLoading} onFileDeleted={loadFiles} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
