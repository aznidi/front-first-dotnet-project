import { axiosClient } from '@/lib/axios';
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest, 
  UserDto 
} from '@/types';

class AuthService {
  private endpoint = '/auth';

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/login`,
      credentials
    );
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<UserDto>> {
    const response = await axiosClient.post<ApiResponse<UserDto>>(
      `${this.endpoint}/join`,
      userData
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/refresh`,
      { refreshToken } as RefreshTokenRequest
    );
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<UserDto>> {
    const response = await axiosClient.get<ApiResponse<UserDto>>(`${this.endpoint}/me`);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
