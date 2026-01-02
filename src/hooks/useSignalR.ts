import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { signalRService } from '@/services/signalr.service';

interface UseSignalROptions {
  hubUrl: string;
  autoConnect?: boolean;
}

export const useSignalR = ({ hubUrl, autoConnect = true }: UseSignalROptions) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );
  const [error, setError] = useState<Error | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startingRef = useRef<Promise<void> | null>(null);

  const connect = useCallback(async () => {
    const conn = connectionRef.current;

    if (conn?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (startingRef.current) {
      return startingRef.current;
    }

    try {
      setError(null);
      const newConnection = conn ?? signalRService.createConnection(hubUrl);
      connectionRef.current = newConnection;
      setConnection(newConnection);
      setConnectionState(newConnection.state);

      startingRef.current = signalRService
        .startConnection(newConnection)
        .then(() => {
          setConnectionState(newConnection.state);
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Failed to connect');
          setError(error);
          console.error('SignalR connection error:', error);
          throw error;
        })
        .finally(() => {
          startingRef.current = null;
        });

      return startingRef.current;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      console.error('SignalR connection error:', error);
    }
  }, [hubUrl]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    if (conn.state !== signalR.HubConnectionState.Disconnected) {
      await signalRService.stopConnection(conn);
      setConnectionState(signalR.HubConnectionState.Disconnected);
    }
  }, []);

  const invoke = useCallback(
    async <T = void>(methodName: string, ...args: unknown[]): Promise<T> => {
      if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
        throw new Error('SignalR connection not established');
      }
      return connectionRef.current.invoke<T>(methodName, ...args);
    },
    []
  );

  const on = useCallback(
    (methodName: string, callback: (...args: unknown[]) => void) => {
      if (connectionRef.current) {
        connectionRef.current.on(methodName, callback);
      }
    },
    []
  );

  const off = useCallback(
    (methodName: string, callback?: (...args: unknown[]) => void) => {
      if (connectionRef.current) {
        if (callback) {
          connectionRef.current.off(methodName, callback);
        } else {
          connectionRef.current.off(methodName);
        }
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    if (autoConnect) {
      connect().catch((err) => {
        if (mounted) {
          console.error('Failed to auto-connect:', err);
        }
      });
    }

    return () => {
      mounted = false;
      if (connectionRef.current && 
          connectionRef.current.state === signalR.HubConnectionState.Connected) {
        signalRService.stopConnection(connectionRef.current);
      }
    };
  }, [autoConnect, connect]);

  const isConnected = connectionState === signalR.HubConnectionState.Connected;
  const isConnecting = connectionState === signalR.HubConnectionState.Connecting || 
                       connectionState === signalR.HubConnectionState.Reconnecting;

  return {
    connection,
    connectionState,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    invoke,
    on,
    off,
  };
};
