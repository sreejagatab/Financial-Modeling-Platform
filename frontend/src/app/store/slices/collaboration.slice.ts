import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  activeSheetId: string | null;
  activeCellId: string | null;
  cursorPosition: { x: number; y: number } | null;
  lastActiveAt: string;
  color: string;
}

export interface Comment {
  id: string;
  targetType: 'cell' | 'range' | 'chart' | 'section';
  targetId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  resolved: boolean;
  replies: Comment[];
}

export interface Annotation {
  id: string;
  targetId: string;
  content: string;
  authorId: string;
  position: { x: number; y: number };
  createdAt: string;
}

interface CollaborationState {
  isConnected: boolean;
  connectionError: string | null;
  presence: Record<string, UserPresence>;
  comments: Record<string, Comment>;
  annotations: Record<string, Annotation>;
  pendingChanges: number;
  lastSyncedAt: string | null;
}

const initialState: CollaborationState = {
  isConnected: false,
  connectionError: null,
  presence: {},
  comments: {},
  annotations: {},
  pendingChanges: 0,
  lastSyncedAt: null,
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    updatePresence: (state, action: PayloadAction<UserPresence>) => {
      state.presence[action.payload.userId] = action.payload;
    },
    removePresence: (state, action: PayloadAction<string>) => {
      delete state.presence[action.payload];
    },
    clearAllPresence: (state) => {
      state.presence = {};
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments[action.payload.id] = action.payload;
    },
    updateComment: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Comment> }>
    ) => {
      const comment = state.comments[action.payload.id];
      if (comment) {
        Object.assign(comment, action.payload.changes);
      }
    },
    resolveComment: (state, action: PayloadAction<string>) => {
      if (state.comments[action.payload]) {
        state.comments[action.payload].resolved = true;
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      delete state.comments[action.payload];
    },
    addAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations[action.payload.id] = action.payload;
    },
    removeAnnotation: (state, action: PayloadAction<string>) => {
      delete state.annotations[action.payload];
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1;
    },
    decrementPendingChanges: (state) => {
      state.pendingChanges = Math.max(0, state.pendingChanges - 1);
    },
    resetPendingChanges: (state) => {
      state.pendingChanges = 0;
    },
    setSyncedAt: (state, action: PayloadAction<string>) => {
      state.lastSyncedAt = action.payload;
    },
  },
});

export const {
  setConnected,
  setConnectionError,
  updatePresence,
  removePresence,
  clearAllPresence,
  addComment,
  updateComment,
  resolveComment,
  deleteComment,
  addAnnotation,
  removeAnnotation,
  incrementPendingChanges,
  decrementPendingChanges,
  resetPendingChanges,
  setSyncedAt,
} = collaborationSlice.actions;

export const collaborationReducer = collaborationSlice.reducer;

// Selectors
export const selectIsConnected = (state: RootState) =>
  state.collaboration.isConnected;

export const selectConnectionError = (state: RootState) =>
  state.collaboration.connectionError;

export const selectAllPresence = (state: RootState) =>
  Object.values(state.collaboration.presence);

export const selectPresenceByUserId = (userId: string) => (state: RootState) =>
  state.collaboration.presence[userId];

export const selectCommentsByTargetId = (targetId: string) => (state: RootState) =>
  Object.values(state.collaboration.comments).filter(
    (comment) => comment.targetId === targetId
  );

export const selectUnresolvedComments = (state: RootState) =>
  Object.values(state.collaboration.comments).filter((comment) => !comment.resolved);

export const selectPendingChanges = (state: RootState) =>
  state.collaboration.pendingChanges;
