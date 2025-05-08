import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_URL } from "./apiService";

const SSE_SUBSCRIBE_URL = `${API_URL}sse/subscribe`;

export interface NewsModel {
  id: number | string;
  title: string;
  content: string;
  date_of_creation: string;
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR'
}

export class SseService {
  private static instance: SseService;
  private eventSource: EventSourcePolyfill | null = null;
  private isConnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private lastEventId: string | null = null;
  private reconnectAttempt: number = 0;
  private newsListeners: ((newsList: NewsModel[]) => void)[] = [];
  private connectionListeners: ((status: ConnectionStatus) => void)[] = [];
  private newsList: NewsModel[] = [];

  private readonly RECONNECT_DELAY_SECONDS = 5;
  private readonly MAX_RECONNECT_DELAY_SECONDS = 60;

  // instance pattern
  public static getInstance(): SseService {
    if (!SseService.instance) {
      SseService.instance = new SseService();
    }
    return SseService.instance;
  }


  // getters and setters
  public addNewsListener(listener: (newsList: NewsModel[]) => void): void {
    this.newsListeners.push(listener);
    if (this.newsList.length > 0) {
      listener([...this.newsList]);
    }
  }
  public removeNewsListener(listener: (newsList: NewsModel[]) => void): void {
    const index = this.newsListeners.indexOf(listener);
    if (index !== -1) {
      this.newsListeners.splice(index, 1);
    }
  }

  public addConnectionListener(listener: (status: ConnectionStatus) => void): void {
    this.connectionListeners.push(listener);
  }
  public removeConnectionListener(listener: (status: ConnectionStatus) => void): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  public connectToSSEServer(): void {
    if (this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;
      this.notifyConnectionStatus(ConnectionStatus.CONNECTING);

      const headers: Record<string, string> = {};
      if (this.lastEventId) {
        headers['Last-Event-ID'] = this.lastEventId;
        console.log('Reconnecting with Last-Event-ID:', this.lastEventId);
      }

      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSourcePolyfill(SSE_SUBSCRIBE_URL, {
        headers,
        heartbeatTimeout: 60000,
        withCredentials: false,
      });

      this.eventSource.onopen = (event: unknown) => this.handleOpen(event as Event);
      this.eventSource.onmessage = (event) => this.handleMessage(event as MessageEvent);
      this.eventSource.onerror = (event: unknown) => this.handleError(event as Event);

      this.eventSource.addEventListener('news-list', (event) =>
        this.handleNewsListEvent(event as MessageEvent)
      );

      console.log('Connecting to SSE server...');
    } catch (error) {
      console.error('Error connecting to SSE server:', error);
      this.notifyConnectionStatus(ConnectionStatus.ERROR);
      this.reconnectToSSEServer();
    } finally {
      this.isConnecting = false;
    }
  }

  public closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.newsList = [];
    this.notifyConnectionStatus(ConnectionStatus.DISCONNECTED);
    console.log('SSE connection closed.');
  }

  public getNewsList(): NewsModel[] {
    return [...this.newsList];
  }

  private handleOpen(event: Event): void {
    console.log('SSE connection opened');
    this.reconnectAttempt = 0;
    this.notifyConnectionStatus(ConnectionStatus.CONNECTED);
  }

  private handleMessage(event: MessageEvent): void {
    console.log('SSE Generic Message Received:', event);
  }

  private handleNewsListEvent(event: MessageEvent): void {
    try {
      console.log('News list event received:', event);

      const updatedNews: NewsModel[] = JSON.parse(event.data);

      this.newsList = updatedNews;

      this.newsListeners.forEach(listener => {
        try {
          listener([...this.newsList]);
        } catch (e) {
          console.error('Error notifying news listener:', e);
        }
      });

      console.log('News list updated, total news:', this.newsList.length);
    } catch (e) {
      console.error('Error parsing news list:', e);
    }
  }

  private handleError(event: Event): void {
    console.error('SSE Connection Error:', event);
    this.notifyConnectionStatus(ConnectionStatus.ERROR);
    this.reconnectToSSEServer();
  }

  private reconnectToSSEServer(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Exponential backoff with a cap
    const delay = Math.min(
      this.RECONNECT_DELAY_SECONDS * Math.pow(2, Math.min(this.reconnectAttempt, 4)),
      this.MAX_RECONNECT_DELAY_SECONDS
    ) * 1000; // Convert to milliseconds

    this.reconnectAttempt++;
    console.log(`Reconnecting to SSE server in ${delay / 1000} seconds (attempt ${this.reconnectAttempt})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connectToSSEServer();
    }, delay);
  }

  private notifyConnectionStatus(status: ConnectionStatus): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (e) {
        console.error('Error notifying connection listener:', e);
      }
    });
  }

  public shutdown(): void {
    console.log('Shutting down SSE Manager');
    this.closeConnection();
    this.newsListeners = [];
    this.connectionListeners = [];
  }
}

export default SseService.getInstance();