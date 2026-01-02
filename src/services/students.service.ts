import { axiosClient } from '@/lib/axios';
import type { 
  ApiResponse, 
  StudentDto, 
  CreateStudentDto, 
  UpdateStudentDto, 
  PatchStudentDto 
} from '@/types';

class StudentsService {
  private endpoint = '/students';

  async getAll(): Promise<ApiResponse<StudentDto[]>> {
    const response = await axiosClient.get<ApiResponse<StudentDto[]>>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<StudentDto>> {
    const response = await axiosClient.get<ApiResponse<StudentDto>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateStudentDto): Promise<ApiResponse<StudentDto>> {
    const response = await axiosClient.post<ApiResponse<StudentDto>>(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: UpdateStudentDto): Promise<ApiResponse<StudentDto>> {
    const response = await axiosClient.put<ApiResponse<StudentDto>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async patch(id: number, data: PatchStudentDto): Promise<ApiResponse<StudentDto>> {
    const response = await axiosClient.patch<ApiResponse<StudentDto>>(
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

export const studentsService = new StudentsService();
