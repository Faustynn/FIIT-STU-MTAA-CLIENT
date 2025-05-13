import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

// News model
export interface NewsModel {
  id: string;
  title: string;
  content: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  date_of_creation: string;
}

// statuses for SSE
export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private pushToken: string | null = null;
  private deviceId: string | null = null;
  private badgeCount: number = 0;
  private newsUpdateHandlers: ((news: NewsModel[]) => void)[] = [];
  private connectionStatusHandlers: ((status: ConnectionStatus) => void)[] = [];
  private lastReceivedNewsIds: Set<string> = new Set(); // Stores IDs of recently received news

  // API endpoints
  private readonly REGISTER_DEVICE_ENDPOINT = `http://147.175.161.45:8080/api/notifications/register-device`;


  // Storage keys
  private readonly PUSH_TOKEN_KEY = 'PUSH_TOKEN';
  private readonly DEVICE_ID_KEY = 'DEVICE_ID';
  private readonly BADGE_COUNT_KEY = 'BADGE_COUNT';
  private readonly LAST_NEWS_DATE_KEY = 'LAST_NEWS_DATE';


  // Subscriptions
  private notificationReceivedSubscription?: Notifications.Subscription;
  private notificationResponseSubscription?: Notifications.Subscription;

  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Configure notif. handler
      this.setupNotificationHandlers();

      // Load/generate device ID
      await this.setupDeviceId();

      // Load saved push token
      await this.loadPushToken();

      // Load badge count
      await this.loadBadgeCount();

      // Configure notif. settings
      await this.configureNotifications();

      // Request permissions
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return false;
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  private async configureNotifications(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  private async setupDeviceId(): Promise<void> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);

      if (!deviceId) {
        deviceId = uuid.v4().toString();
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }

      this.deviceId = deviceId;
      console.log('Device ID:', this.deviceId);
    } catch (error) {
      console.error('Error setting up device ID:', error);
      this.deviceId = `device_${Date.now()}`;
    }
  }

  private async loadPushToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(this.PUSH_TOKEN_KEY);
      if (token) {
        this.pushToken = token;
        console.log('Loaded saved push token');
      }
    } catch (error) {
      console.error('Failed to load push token:', error);
    }
  }

  private async loadBadgeCount(): Promise<void> {
    try {
      const countStr = await AsyncStorage.getItem(this.BADGE_COUNT_KEY) || '0';
      this.badgeCount = parseInt(countStr, 10);
      console.log('Loaded badge count:', this.badgeCount);

      await Notifications.setBadgeCountAsync(this.badgeCount);
    } catch (error) {
      console.error('Failed to load badge count:', error);
      this.badgeCount = 0;
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, token);
      this.pushToken = token;
      console.log('Saved push token');
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  private async requestNotificationPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available in the simulator');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If permission dont disagree before, ask again
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: false,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return false;
      }

      console.log('Notification permission granted');

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      const token = tokenData.data;
      console.log('Expo push token:', token);

      await this.savePushToken(token);

      // Register with backend
      await this.registerDeviceWithServer();
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Set up notif. handlers
  private setupNotificationHandlers(): void {
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }

    this.notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('Notification received in foreground:', notification);
        await this.incrementBadgeCount();

        // Extract news ID from notif. data
        const newsId = notification.request.content.data?.newsId as string;
        if (typeof newsId === 'string') {
          console.log(`Received news notification with ID: ${newsId}`);
          this.lastReceivedNewsIds.add(newsId);
          await AsyncStorage.setItem('LAST_RECEIVED_NEWS_ID', newsId);
        }
      }
    );

    // Handler when user taps on a notif.
    this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response received:', response);
        const newsId = response.notification.request.content.data?.newsId as string;
        if (newsId) {
          console.log(`User tapped notification for news ID: ${newsId}`);
          // TODO: future news detail page
        }
      }
    );
  }

  // Register device with server
  private async registerDeviceWithServer(): Promise<boolean> {
    if (!this.pushToken || !this.deviceId) {
      console.error('Cannot register device: missing push token or device ID');
      return false;
    }

    try {
      console.log(`Registering device with endpoint: ${this.REGISTER_DEVICE_ENDPOINT}`);

      const response = await fetch(this.REGISTER_DEVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          pushToken: this.pushToken,
          platform: Platform.OS,
          type: 'expo'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to register device with server: ${response.status}`, errorText);
        return false;
      }

      console.log('Device registered successfully with server');
      return true;
    } catch (error) {
      console.error('Error registering device with server:', error);
      return false;
    }
  }

  // Check and send info about new news
  public checkForNewNews(newsList: NewsModel[]): void {
    if (!newsList || newsList.length === 0) return;

    this.getLastNewsDate().then(lastKnownDate => {
      if (!lastKnownDate) {
        const latestNews = this.getLatestNews(newsList);
        if (latestNews) {
          this.saveLastNewsDate(new Date(latestNews.date_of_creation));
        }
        return;
      }
      const newNews = newsList.filter(news => {
        const newsDate = new Date(news.date_of_creation);
        return newsDate > lastKnownDate && !this.lastReceivedNewsIds.has(news.id);
      });

      if (newNews.length > 0) {
        console.log(`Found ${newNews.length} new news items`);

        const latestNews = this.getLatestNews(newsList);
        if (latestNews) {
          this.saveLastNewsDate(new Date(latestNews.date_of_creation));
        }

        newNews.forEach(news => {
          this.sendLocalNotification(news);
          this.lastReceivedNewsIds.add(news.id);
        });
      }
    });
  }

  private async getLastNewsDate(): Promise<Date | null> {
    try {
      const dateStr = await AsyncStorage.getItem(this.LAST_NEWS_DATE_KEY);
      return dateStr ? new Date(dateStr) : null;
    } catch (error) {
      console.error('Error getting last news date:', error);
      return null;
    }
  }

  private async saveLastNewsDate(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LAST_NEWS_DATE_KEY, date.toISOString());
    } catch (error) {
      console.error('Error saving last news date:', error);
    }
  }

  private getLatestNews(newsList: NewsModel[]): NewsModel | null {
    if (!newsList || newsList.length === 0) return null;

    return newsList.reduce((latest, current) => {
      const latestDate = new Date(latest.date_of_creation);
      const currentDate = new Date(current.date_of_creation);
      return currentDate > latestDate ? current : latest;
    }, newsList[0]);
  }

  private async sendLocalNotification(news: NewsModel): Promise<void> {
    try {
      await this.incrementBadgeCount();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New News',
          body: news.title,
          data: { newsId: news.id },
          badge: this.badgeCount,
        },
        trigger: null,  // Send now
      });

      console.log(`Local notification sent for news: ${news.id}`);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Get the current push token
  public getPushToken(): string | null {
    return this.pushToken;
  }

  // Get the device ID
  public getDeviceId(): string | null {
    return this.deviceId;
  }

  // Badge management methods
  public async getBadgeCountAsync(): Promise<number> {
    try {
      const systemCount = await Notifications.getBadgeCountAsync();
      if (this.badgeCount !== systemCount) {
        this.badgeCount = systemCount;
        await this.saveBadgeCount();
      }
    } catch (error) {
      console.error('Error getting system badge count:', error);
    }

    return this.badgeCount;
  }

  private async saveBadgeCount(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.BADGE_COUNT_KEY, this.badgeCount.toString());
    } catch (error) {
      console.error('Error saving badge count:', error);
    }
  }

  public async incrementBadgeCount(): Promise<void> {
    this.badgeCount += 1;
    await Notifications.setBadgeCountAsync(this.badgeCount);
    await this.saveBadgeCount();
  }

  public async resetBadgeCount(): Promise<void> {
    this.badgeCount = 0;
    await Notifications.setBadgeCountAsync(0);
    await this.saveBadgeCount();
  }

  public addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  public addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  public removeNotificationSubscription(subscription: Notifications.Subscription): void {
    subscription.remove();
  }

  // News update handlers
  public addNewsUpdateHandler(handler: (news: NewsModel[]) => void): void {
    this.newsUpdateHandlers.push(handler);
  }

  public removeNewsUpdateHandler(handler: (news: NewsModel[]) => void): void {
    this.newsUpdateHandlers = this.newsUpdateHandlers.filter(h => h !== handler);
  }

  public notifyNewsUpdate(news: NewsModel[]): void {
    this.checkForNewNews(news);
    this.newsUpdateHandlers.forEach(handler => handler(news));
  }

  // Connection status handlers
  public addConnectionStatusHandler(handler: (status: ConnectionStatus) => void): void {
    this.connectionStatusHandlers.push(handler);
  }

  public removeConnectionStatusHandler(handler: (status: ConnectionStatus) => void): void {
    this.connectionStatusHandlers = this.connectionStatusHandlers.filter(h => h !== handler);
  }

  public updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatusHandlers.forEach(handler => handler(status));
  }

  // Clean up / remove all subscriptions when component unmounts
  public cleanup(): void {
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }
  }
}

export default NotificationService.getInstance();