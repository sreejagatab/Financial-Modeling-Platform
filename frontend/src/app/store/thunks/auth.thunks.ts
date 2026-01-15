/**
 * Auth Async Thunks
 * Redux thunks for authentication operations
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../../services/api';
import type { LoginRequest, RegisterRequest, User } from '../../../services/api';
import {
  setLoading,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateUser,
} from '../slices/auth.slice';

/**
 * Login thunk
 */
export const login = createAsyncThunk<
  { user: User; token: string },
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  dispatch(setLoading(true));

  try {
    const response = await authApi.login(credentials);

    const result = {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatar_url: response.user.avatar_url,
        is_active: response.user.is_active,
        is_verified: response.user.is_verified,
        created_at: response.user.created_at,
        updated_at: response.user.updated_at,
      },
      token: response.access_token,
    };

    dispatch(loginSuccess({ user: { ...result.user, avatar: result.user.avatar_url }, token: result.token }));
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    dispatch(loginFailure(message));
    return rejectWithValue(message);
  }
});

/**
 * Register thunk
 */
export const register = createAsyncThunk<
  { user: User; token: string },
  RegisterRequest,
  { rejectValue: string }
>('auth/register', async (data, { dispatch, rejectWithValue }) => {
  dispatch(setLoading(true));

  try {
    const response = await authApi.register(data);

    const result = {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatar_url: response.user.avatar_url,
        is_active: response.user.is_active,
        is_verified: response.user.is_verified,
        created_at: response.user.created_at,
        updated_at: response.user.updated_at,
      },
      token: response.access_token,
    };

    dispatch(loginSuccess({ user: { ...result.user, avatar: result.user.avatar_url }, token: result.token }));
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    dispatch(loginFailure(message));
    return rejectWithValue(message);
  }
});

/**
 * Logout thunk
 */
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await authApi.logout();
      dispatch(logoutAction());
    } catch (error: unknown) {
      // Still logout locally even if server request fails
      dispatch(logoutAction());
      const message = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get current user thunk
 */
export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      dispatch(
        updateUser({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar_url,
        })
      );
      return user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update profile thunk
 */
export const updateProfile = createAsyncThunk<
  User,
  { name?: string; avatar_url?: string },
  { rejectValue: string }
>('auth/updateProfile', async (data, { dispatch, rejectWithValue }) => {
  try {
    const user = await authApi.updateProfile(data);
    dispatch(
      updateUser({
        name: user.name,
        avatar: user.avatar_url,
      })
    );
    return user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return rejectWithValue(message);
  }
});

/**
 * Change password thunk
 */
export const changePassword = createAsyncThunk<
  void,
  { current_password: string; new_password: string },
  { rejectValue: string }
>('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    await authApi.changePassword(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return rejectWithValue(message);
  }
});
