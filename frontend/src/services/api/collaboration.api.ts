/**
 * Collaboration API Service
 * Handles comments, annotations, presence, and real-time collaboration
 */

import { apiClient } from './client';
import type {
  Comment,
  Annotation,
  CellEdit,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateAnnotationRequest,
} from './types';

export interface UserPresence {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  current_sheet_id?: string;
  current_cell?: string;
  last_activity: string;
  color: string;
}

export const collaborationApi = {
  // ===== Comments =====

  /**
   * Get comments for a model
   */
  async getComments(
    modelId: string,
    params?: { sheet_id?: string; cell_address?: string; include_resolved?: boolean }
  ): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>('/collaboration/comments', {
      params: { model_id: modelId, ...params },
    });
    return response.data;
  },

  /**
   * Get a single comment with replies
   */
  async getComment(commentId: string): Promise<Comment> {
    const response = await apiClient.get<Comment>(`/collaboration/comments/${commentId}`);
    return response.data;
  },

  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<Comment>('/collaboration/comments', data);
    return response.data;
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/collaboration/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Resolve a comment
   */
  async resolveComment(commentId: string): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/collaboration/comments/${commentId}`, {
      is_resolved: true,
    });
    return response.data;
  },

  /**
   * Unresolve a comment
   */
  async unresolveComment(commentId: string): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/collaboration/comments/${commentId}`, {
      is_resolved: false,
    });
    return response.data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/collaboration/comments/${commentId}`);
  },

  /**
   * Reply to a comment
   */
  async replyToComment(commentId: string, content: string, modelId: string): Promise<Comment> {
    const response = await apiClient.post<Comment>('/collaboration/comments', {
      model_id: modelId,
      content,
      parent_id: commentId,
    });
    return response.data;
  },

  // ===== Annotations =====

  /**
   * Get annotations for a model
   */
  async getAnnotations(
    modelId: string,
    params?: { sheet_id?: string; annotation_type?: string }
  ): Promise<Annotation[]> {
    const response = await apiClient.get<Annotation[]>('/collaboration/annotations', {
      params: { model_id: modelId, ...params },
    });
    return response.data;
  },

  /**
   * Create an annotation
   */
  async createAnnotation(data: CreateAnnotationRequest): Promise<Annotation> {
    const response = await apiClient.post<Annotation>('/collaboration/annotations', data);
    return response.data;
  },

  /**
   * Delete an annotation
   */
  async deleteAnnotation(annotationId: string): Promise<void> {
    await apiClient.delete(`/collaboration/annotations/${annotationId}`);
  },

  // ===== Presence =====

  /**
   * Get active users for a model
   */
  async getPresence(modelId: string): Promise<UserPresence[]> {
    const response = await apiClient.get<UserPresence[]>(`/collaboration/presence/${modelId}`);
    return response.data;
  },

  // ===== Edit History =====

  /**
   * Get recent edits for a model
   */
  async getRecentEdits(modelId: string, limit = 100): Promise<CellEdit[]> {
    const response = await apiClient.get<CellEdit[]>(`/collaboration/edits/${modelId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get edit history for a specific cell
   */
  async getCellEditHistory(
    modelId: string,
    sheetId: string,
    cellAddress: string,
    limit = 50
  ): Promise<CellEdit[]> {
    const response = await apiClient.get<CellEdit[]>(
      `/collaboration/edits/${modelId}/${sheetId}/${cellAddress}`,
      { params: { limit } }
    );
    return response.data;
  },
};
