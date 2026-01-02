import * as signalR from '@microsoft/signalr';
import { env } from '@/config/env';

function buildUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  createConnection(hubUrl: string): signalR.HubConnection {
    const fullUrl = buildUrl(hubUrl);
    
    // console.log('SignalR connecting to:', fullUrl);
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(fullUrl, {
        withCredentials: false,
        accessTokenFactory: () => {
          return localStorage.getItem('accessToken') || '';
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null;
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.error('SignalR connection closed:', error);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached');
      }
    });

    return this.connection;
  }

  async startConnection(connection: signalR.HubConnection): Promise<void> {
    try {
      await connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  async stopConnection(connection: signalR.HubConnection | null): Promise<void> {
    if (connection) {
      try {
        await connection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  getConnectionState(connection: signalR.HubConnection | null): signalR.HubConnectionState {
    return connection?.state || signalR.HubConnectionState.Disconnected;
  }
}

export const signalRService = new SignalRService();
