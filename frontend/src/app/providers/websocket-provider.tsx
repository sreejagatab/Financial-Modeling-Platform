import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../store/slices/auth.slice';
import {
  setConnected,
  setConnectionError,
  updatePresence,
} from '../store/slices/collaboration.slice';
import { updateCellsBatch } from '../store/slices/models.slice';
import type { RootState } from '../store';

interface WebSocketMessage {
  type:
    | 'presence'
    | 'cell_update'
    | 'comment'
    | 'annotation'
    | 'calculation_complete'
    | 'error';
  payload: unknown;
  timestamp: string;
  userId: string;
}

interface WebSocketContextValue {
  isConnected: boolean;
  send: (message: Omit<WebSocketMessage, 'timestamp' | 'userId'>) => void;
  subscribe: (type: string, callback: (payload: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(payload: unknown) => void>>>(
    new Map()
  );
  const reconnectTimeoutRef = useRef<number | null>(null);

  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const activeModelId = useSelector(
    (state: RootState) => state.models.activeModelId
  );

  const connect = useCallback(() => {
    if (!token || !activeModelId) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/models/${activeModelId}?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        dispatch(setConnected(true));

        // Send initial presence
        if (user) {
          ws.send(
            JSON.stringify({
              type: 'presence',
              payload: {
                userId: user.id,
                userName: user.name,
                status: 'online',
              },
              timestamp: new Date().toISOString(),
              userId: user.id,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle message types
          switch (message.type) {
            case 'presence':
              dispatch(updatePresence(message.payload as any));
              break;
            case 'cell_update':
              dispatch(updateCellsBatch((message.payload as any).cells));
              break;
            case 'error':
              console.error('WebSocket error:', message.payload);
              break;
          }

          // Notify subscribers
          const subscribers = subscribersRef.current.get(message.type);
          if (subscribers) {
            subscribers.forEach((callback) => callback(message.payload));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        dispatch(setConnected(false));

        // Attempt reconnection after delay (unless intentionally closed)
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch(setConnectionError('Connection error'));
        ws.close();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      dispatch(setConnectionError('Failed to connect'));
    }
  }, [token, activeModelId, user, dispatch]);

  // Connect when dependencies change
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, [connect]);

  // Send message function
  const send = useCallback(
    (message: Omit<WebSocketMessage, 'timestamp' | 'userId'>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && user) {
        wsRef.current.send(
          JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
            userId: user.id,
          })
        );
      }
    },
    [user]
  );

  // Subscribe function
  const subscribe = useCallback(
    (type: string, callback: (payload: unknown) => void) => {
      if (!subscribersRef.current.has(type)) {
        subscribersRef.current.set(type, new Set());
      }
      subscribersRef.current.get(type)!.add(callback);

      // Return unsubscribe function
      return () => {
        subscribersRef.current.get(type)?.delete(callback);
      };
    },
    []
  );

  const value: WebSocketContextValue = {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    send,
    subscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
