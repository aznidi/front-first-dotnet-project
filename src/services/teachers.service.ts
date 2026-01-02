import { axiosClient } from '@/lib/axios';
import type { 
  ApiResponse, 
  TeacherDto, 
  CreateTeacherDto, 
  UpdateTeacherDto, 
  PatchTeacherDto 
} from '@/types';

class TeachersService {
  private endpoint = '/teachers';

  async getAll(): Promise<ApiResponse<TeacherDto[]>> {
    const response = await axiosClient.get<ApiResponse<TeacherDto[]>>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<TeacherDto>> {
    const response = await axiosClient.get<ApiResponse<TeacherDto>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateTeacherDto): Promise<ApiResponse<TeacherDto>> {
    const response = await axiosClient.post<ApiResponse<TeacherDto>>(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: UpdateTeacherDto): Promise<ApiResponse<TeacherDto>> {
    const response = await axiosClient.put<ApiResponse<TeacherDto>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async patch(id: number, data: PatchTeacherDto): Promise<ApiResponse<TeacherDto>> {
    const response = await axiosClient.patch<ApiResponse<TeacherDto>>(
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

export const teachersService = new TeachersService();
