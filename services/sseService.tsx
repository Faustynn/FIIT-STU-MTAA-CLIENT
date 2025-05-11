import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_URL } from "./apiService";
import NotificationService, { NewsModel, ConnectionStatus } from './NotificationService';

// Ensure the URL has no double slashes in path segments
const SSE_SUBSCRIBE_URL = `${API_URL}sse/subscribe`;

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
  private lastCheckedNewsList: NewsModel[] = []; // для отслеживания изменений в списке новостей

  private readonly RECONNECT_DELAY_SECONDS = 5;
  private readonly MAX_RECONNECT_DELAY_SECONDS = 60;

  // Singleton pattern
  public static getInstance(): SseService {
    if (!SseService.instance) {
      SseService.instance = new SseService();
    }
    return SseService.instance;
  }

  private constructor() {
    this.registerWithNotificationService();
  }


  private registerWithNotificationService(): void {
    NotificationService.addConnectionStatusHandler(status => {
    });
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
        withCredentials: true,
      });

      this.eventSource.onopen = (event: unknown) => this.handleOpen(event as Event);
      this.eventSource.onmessage = (event) => this.handleMessage(event as MessageEvent);
      this.eventSource.onerror = (event: unknown) => this.handleError(event as Event);

      this.eventSource.addEventListener('news-list', (event) =>
        this.handleNewsListEvent(event as MessageEvent)
      );

      console.log('Connecting to SSE server:', SSE_SUBSCRIBE_URL);
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

      // we have new news?
      const hasUpdates = this.checkForNewsUpdates(updatedNews);

      // save state
      this.lastCheckedNewsList = [...updatedNews];
      this.newsList = updatedNews;

      // Notify local listeners
      this.notifyNewsUpdate(updatedNews);

      // Notify if we have updates
      if (hasUpdates) {
        console.log('Notifying about news updates');
        NotificationService.notifyNewsUpdate(updatedNews);
      }

      console.log('News list updated, total news:', this.newsList.length);
    } catch (e) {
      console.error('Error parsing news list:', e);
    }
  }

  private checkForNewsUpdates(newsList: NewsModel[]): boolean {
    if (this.lastCheckedNewsList.length === 0) {
      return newsList.length > 0;
    }
    if (newsList.length !== this.lastCheckedNewsList.length) {
      return true;
    }

    const existingNewsMap = new Map<string, NewsModel>();
    this.lastCheckedNewsList.forEach(news => {
      existingNewsMap.set(news.id, news);
    });

    for (const news of newsList) {
      const existingNews = existingNewsMap.get(news.id);

      if (!existingNews ||
        existingNews.title !== news.title ||
        existingNews.content !== news.content ||
        existingNews.date_of_creation !== news.date_of_creation) {
        return true;
      }
    }
    return false;
  }

  private notifyNewsUpdate(newsList: NewsModel[]): void {
    this.newsListeners.forEach(listener => {
      try {
        listener([...newsList]);
      } catch (e) {
        console.error('Error notifying news listener:', e);
      }
    });
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

    const delay = Math.min(
      this.RECONNECT_DELAY_SECONDS * Math.pow(2, Math.min(this.reconnectAttempt, 4)),
      this.MAX_RECONNECT_DELAY_SECONDS
    ) * 1000;

    this.reconnectAttempt++;
    console.log(`Reconnecting to SSE server in ${delay / 1000} seconds (attempt ${this.reconnectAttempt})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connectToSSEServer();
    }, delay);
  }

  private notifyConnectionStatus(status: ConnectionStatus): void {
    // Notify local listeners
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (e) {
        console.error('Error notifying connection listener:', e);
      }
    });

    // Notify notification service
    NotificationService.updateConnectionStatus(status);
  }

  public shutdown(): void {
    console.log('Shutting down SSE Manager');
    this.closeConnection();
    this.newsListeners = [];
    this.connectionListeners = [];
  }
}

export default SseService.getInstance();