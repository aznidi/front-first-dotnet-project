export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserDto {
  userId: number;
  name: string;
  email: string;
  isAuth?: boolean;
  roles?: string[];
  isActive?: boolean;
}

export interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  cin: string;
  dateNaissance: string;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  cin: string;
  dateNaissance: string;
}

export interface UpdateStudentDto {
  firstName: string;
  lastName: string;
  cin: string;
  dateNaissance: string;
}

export interface PatchStudentDto {
  firstName?: string;
  lastName?: string;
  cin?: string;
  dateNaissance?: string;
}

export interface TeacherDto {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
}

export interface CreateTeacherDto {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
}

export interface UpdateTeacherDto {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
}

export interface PatchTeacherDto {
  nom?: string;
  prenom?: string;
  cin?: string;
  dateNaissance?: string;
}

export interface SubjectDto {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface UpdateSubjectDto {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface PatchSubjectDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ContactDto {
  id: number;
  fullName: string;
  email: string;
}

export interface PrivateMessageDto {
  fromUserId: string;
  toUserId: string;
  message: string;
  sentAt: string;
}

export interface ConversationReadyDto {
  conversationId: number;
  otherUserId: number;
}

export interface ChatMessageDto {
  id: number;
  conversationId: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export interface ClassDto {
  id: number;
  name: string;
  description: string;
  capacity: number;
}

export interface CreateClassDto {
  name: string;
  description?: string | null;
  capacity: number;
}

export interface UpdateClassDto {
  name: string;
  description?: string | null;
  capacity: number;
}

export interface CreateClassResponseDto {
  id: number;
  success: boolean;
}

export interface UpdateClassResponseDto {
  id: number;
  name: string;
  description?: string | null;
  capacity: number;
}
