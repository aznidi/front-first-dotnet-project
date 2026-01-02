import { axiosClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export class ApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async get<T>(id?: string | number): Promise<ApiResponse<T>> {
    const url = id ? `${this.endpoint}/${id}` : this.endpoint;
    const response = await axiosClient.get<ApiResponse<T>>(url);
    return response.data;
  }

  async getAll<T>(params?: Record<string, unknown>): Promise<ApiResponse<T[]>> {
    const response = await axiosClient.get<ApiResponse<T[]>>(this.endpoint, { params });
    return response.data;
  }

  async post<T>(data: unknown): Promise<ApiResponse<T>> {
    const response = await axiosClient.post<ApiResponse<T>>(this.endpoint, data);
    return response.data;
  }

  async put<T>(id: string | number, data: unknown): Promise<ApiResponse<T>> {
    const response = await axiosClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete<T>(id: string | number): Promise<ApiResponse<T>> {
    const response = await axiosClient.delete<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return response.data;
  }
}
