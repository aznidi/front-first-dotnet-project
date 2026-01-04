import { axiosClient } from '@/lib/axios';
import { env } from '@/config/env';
import type { ApiResponse, StoredFileDto } from '@/types';

class FilesService {
  private readonly endpoint = '/files';

  async uploadFile(file: File): Promise<ApiResponse<StoredFileDto>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<ApiResponse<StoredFileDto>>(`${this.endpoint}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async listFiles(): Promise<ApiResponse<StoredFileDto[]>> {
    const response = await axiosClient.get<ApiResponse<StoredFileDto[]>>(this.endpoint);
    return response.data;
  }

  async deleteFile(id: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  getDownloadUrl(id: string): string {
    return `${env.apiBaseUrl}${this.endpoint}/${id}`;
  }

  async downloadFile(id: string, fileName: string): Promise<void> {
    const response = await axiosClient.get(`${this.endpoint}/${id}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const filesService = new FilesService();
