import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const OFFLINE_NOTIFICATION_INTERVAL = 30 * 1000; // 0.5 minut. every
const MAX_OFFLINE_NOTIFICATIONS = 5;

let offlineNotificationTimer: NodeJS.Timeout | null = null;
let offlineNotificationCount = 0;
let lastAppClosureTime: Date | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

export async function saveAppClosureTime() {
  try {
    lastAppClosureTime = new Date();
    await AsyncStorage.setItem('LAST_APP_CLOSURE_TIME', lastAppClosureTime.toISOString());

    offlineNotificationCount = 0;
    await AsyncStorage.setItem('OFFLINE_NOTIFICATION_COUNT', '0');

    startOfflineNotificationSchedule();
  } catch (error) {
    console.error('Error saving app closure time:', error);
  }
}

function startOfflineNotificationSchedule() {
  if (offlineNotificationTimer) {
    clearInterval(offlineNotificationTimer);
  }

  if (!lastAppClosureTime || offlineNotificationCount >= MAX_OFFLINE_NOTIFICATIONS) {
    return;
  }

  offlineNotificationTimer = setInterval(async () => {
    try {
      if (offlineNotificationCount >= MAX_OFFLINE_NOTIFICATIONS) {
        if (offlineNotificationTimer) {
          clearInterval(offlineNotificationTimer);
        }
        return;
      }

      // Schedule offline notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hi!',
          body: 'We miss you! Come back to the app!',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      // Increment count
      offlineNotificationCount++;
      await AsyncStorage.setItem('OFFLINE_NOTIFICATION_COUNT', offlineNotificationCount.toString());

      // Stop send if max count reach
      if (offlineNotificationCount >= MAX_OFFLINE_NOTIFICATIONS) {
        if (offlineNotificationTimer) {
          clearInterval(offlineNotificationTimer);
        }
      }
    } catch (error) {
      console.error('Error scheduling offline notification:', error);
    }
  }, OFFLINE_NOTIFICATION_INTERVAL);
}


export async function initOfflineNotifications() {
  try {
    const lastClosureTimeStr = await AsyncStorage.getItem('LAST_APP_CLOSURE_TIME');
    const savedNotificationCountStr = await AsyncStorage.getItem('OFFLINE_NOTIFICATION_COUNT');

    if (lastClosureTimeStr) {
      lastAppClosureTime = new Date(lastClosureTimeStr);
      offlineNotificationCount = savedNotificationCountStr
        ? parseInt(savedNotificationCountStr, 10)
        : 0;

      if (offlineNotificationCount < MAX_OFFLINE_NOTIFICATIONS) {
        startOfflineNotificationSchedule();
      }
    }
  } catch (error) {
    console.error('Error initializing offline notifications:', error);
  }
}