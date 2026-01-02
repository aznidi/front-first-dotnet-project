import { axiosClient } from '@/lib/axios';
import type { 
  ApiResponse, 
  SubjectDto, 
  CreateSubjectDto, 
  UpdateSubjectDto, 
  PatchSubjectDto 
} from '@/types';

class SubjectsService {
  private endpoint = '/subjects';

  async getAll(): Promise<ApiResponse<SubjectDto[]>> {
    const response = await axiosClient.get<ApiResponse<SubjectDto[]>>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<SubjectDto>> {
    const response = await axiosClient.get<ApiResponse<SubjectDto>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateSubjectDto): Promise<ApiResponse<SubjectDto>> {
    const response = await axiosClient.post<ApiResponse<SubjectDto>>(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: UpdateSubjectDto): Promise<ApiResponse<SubjectDto>> {
    const response = await axiosClient.put<ApiResponse<SubjectDto>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async patch(id: number, data: PatchSubjectDto): Promise<ApiResponse<SubjectDto>> {
    const response = await axiosClient.patch<ApiResponse<SubjectDto>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return response.data;
  }
}

export const subjectsService = new SubjectsService();
