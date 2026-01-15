import { configureStore } from '@reduxjs/toolkit';
import { modelsReducer } from './slices/models.slice';
import { collaborationReducer } from './slices/collaboration.slice';
import { authReducer } from './slices/auth.slice';

export const store = configureStore({
  reducer: {
    models: modelsReducer,
    collaboration: collaborationReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['collaboration.websocket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for typed dispatch and selector
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export thunks
export * from './thunks';
