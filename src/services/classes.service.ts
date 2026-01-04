import { axiosClient } from '@/lib/axios';
import type { ApiResponse, ClassDto, CreateClassDto, UpdateClassDto, CreateClassResponseDto, UpdateClassResponseDto } from '@/types';

class ClassesService {
  async getAll(): Promise<ApiResponse<ClassDto[]>> {
    const response = await axiosClient.get<ApiResponse<ClassDto[]>>('/Classes');
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<ClassDto>> {
    const response = await axiosClient.get<ApiResponse<ClassDto>>(`/Classes/${id}`);
    return response.data;
  }

  async create(data: CreateClassDto): Promise<ApiResponse<CreateClassResponseDto>> {
    const response = await axiosClient.post<ApiResponse<CreateClassResponseDto>>('/Classes', data);
    return response.data;
  }

  async update(id: number, data: UpdateClassDto): Promise<ApiResponse<UpdateClassResponseDto>> {
    const response = await axiosClient.put<ApiResponse<UpdateClassResponseDto>>(`/Classes/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/Classes/${id}`);
    return response.data;
  }
}

export const classesService = new ClassesService();
