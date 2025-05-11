import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging, getToken, onMessage, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import uuid from 'react-native-uuid';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  private fcmToken: string | null = null;
  private deviceId: string | null = null;
  private badgeCount: number = 0;
  private newsUpdateHandlers: ((news: NewsModel[]) => void)[] = [];
  private connectionStatusHandlers: ((status: ConnectionStatus) => void)[] = [];
  private lastReceivedNewsIds: Set<string> = new Set(); // Хранит ID последних полученных новостей

  // Storage keys
  private readonly FCM_TOKEN_KEY = 'FCM_TOKEN';
  private readonly DEVICE_ID_KEY = 'DEVICE_ID';
  private readonly BADGE_COUNT_KEY = 'BADGE_COUNT';
  private readonly LAST_NEWS_DATE_KEY = 'LAST_NEWS_DATE';

  // API endpoints
  private readonly REGISTER_DEVICE_ENDPOINT = `http://192.168.0.119:8080/api/notifications/register-device`;
  private readonly TEST_NOTIFICATION_ENDPOINT = `http://192.168.0.119:8080/api/notifications/test`;


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
      try {
        getApp();
        console.log('Firebase already initialized');
      } catch (error) {
        console.error('Firebase not available or not properly initialized:', error);
      }

      // Configure background notific.
      this.setupBackgroundNotificationHandler();

      // Load or generate device ID
      await this.setupDeviceId();

      // Load saved FCM token
      await this.loadFcmToken();

      // Load badge count
      await this.loadBadgeCount();

      // Request FCM permissions and register for push notific.
      const hasPermission = await this.requestFcmPermission();
      if (!hasPermission) {
        console.log('FCM permission denied');
        return false;
      }

      // token refresh listener
      this.setupTokenRefreshListener();

      //notification handlers
      this.setupNotificationHandlers();

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }


  // background notification handler
  private setupBackgroundNotificationHandler(): void {
    try {
      const messaging = getMessaging();
      messaging.setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Message handled in the background!', remoteMessage);
        await this.incrementBadgeCount();

        const newsId = remoteMessage.data?.newsId;
        if (typeof newsId === 'string') {
          this.lastReceivedNewsIds.add(newsId);
          await AsyncStorage.setItem('LAST_RECEIVED_NEWS_ID', newsId);
        } else {
          console.error('Invalid newsId type:', newsId);
        }

        // send local notification
        if (remoteMessage.notification) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification?.title || 'New notification',
              body: remoteMessage.notification?.body || 'You have new message!',
              data: remoteMessage.data || {},
              badge: this.badgeCount,
            },
            trigger: null,
          });
        }
      });
    } catch (error) {
      console.error('Error setting up background handler:', error);
    }
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

  private async loadFcmToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(this.FCM_TOKEN_KEY);
      if (token) {
        this.fcmToken = token;
        console.log('Loaded saved FCM token');
      }
    } catch (error) {
      console.error('Failed to load FCM token:', error);
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

  private async saveFcmToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FCM_TOKEN_KEY, token);
      this.fcmToken = token;
      console.log('Saved FCM token');
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  private async requestFcmPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available in the simulator');
      return false;
    }

    try {
      const messaging = getMessaging();

      // ask for permission for notifi.
      const authStatus = await requestPermission(messaging, {
        alert: true,
        provisional: false,
        sound: true,
        badge: true,
      });

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FCM permission granted');

        const token = await getToken(messaging);
        if (token) {
          await this.saveFcmToken(token);
          console.log('FCM token obtained');

          // Register with backend
          await this.registerDeviceWithServer();
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error requesting FCM permissions:', error);
      return false;
    }
  }

  // Set up token refresh handler
  private setupTokenRefreshListener(): void {
    try {
      const messaging = getMessaging();
      messaging.onTokenRefresh(async (token) => {
        console.log('FCM token refreshed');
        await this.saveFcmToken(token);
        await this.registerDeviceWithServer();
      });
    } catch (error) {
      console.error('Error setting up token refresh listener:', error);
    }
  }

  // Set up notification handlers for foreground and background
  private setupNotificationHandlers(): void {
    try {
      // Foreground handler using non-deprecated approach
      const messaging = getMessaging();
      const unsubscribe = onMessage(messaging, async remoteMessage => {
        console.log('Received foreground notification:', remoteMessage);

        // Increment badge count
        await this.incrementBadgeCount();

        // Extract news ID
        const newsId = remoteMessage.data?.newsId;
        if (typeof newsId === 'string') {
          console.log(`Received news notification with ID: ${newsId}`);
          this.lastReceivedNewsIds.add(newsId);
        } else {
          console.error('Invalid newsId type2:', newsId);
        }

        // Show local notification when app in foreground
        if (remoteMessage.notification) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification?.title || 'New notification',
              body: remoteMessage.notification?.body || 'You have new message!',
              data: remoteMessage.data || {},
              badge: this.badgeCount,
            },
            trigger: null,
          });
        }
      });

      // Save unsubscribe function for later cleanup
      this.unsubscribe = unsubscribe;
    } catch (error) {
      console.error('Error setting up notification handlers:', error);
      this.unsubscribe = () => {};
    }
  }

  private unsubscribe: () => void = () => {};

  // Register device with server
  private async registerDeviceWithServer(): Promise<boolean> {
    if (!this.fcmToken || !this.deviceId) {
      console.error('Cannot register device: missing FCM token or device ID');
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
          fcmToken: this.fcmToken,
          platform: Platform.OS
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


  // check and send info about new news
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
        trigger: null,
      });

      console.log(`Local notification sent for news: ${news.id}`);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }



  // Get the current FCM token
  public getFcmToken(): string | null {
    return this.fcmToken;
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

  // Expo notifications handling
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
}

export default NotificationService.getInstance();