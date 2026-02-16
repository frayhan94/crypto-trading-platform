/**
 * User DTO representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Authentication state DTO
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic API response DTO
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
