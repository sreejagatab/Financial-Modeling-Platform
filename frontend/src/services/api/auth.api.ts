/**
 * Authentication API Service
 * Handles user authentication, registration, and token management
 */

import { apiClient } from './client';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    // Store refresh token
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }

    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);

    // Store refresh token
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Logout and revoke token
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        // Ignore errors on logout
        console.warn('Logout request failed:', error);
      }
    }

    localStorage.removeItem('refreshToken');
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<Pick<User, 'name' | 'avatar_url'>>): Promise<User> {
    const response = await apiClient.put<User>('/auth/me', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    await apiClient.post('/auth/change-password', data);
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset/request', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: { token: string; new_password: string }): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', data);
  },
};
