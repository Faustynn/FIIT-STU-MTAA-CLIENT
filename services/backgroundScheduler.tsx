import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundFetchResult } from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const TASK_NAME = 'check-user-expiration';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const loginData = await AsyncStorage.getItem('login_expiration');
    if (!loginData) return BackgroundFetchResult.NewData;

    const { time, expiresInMinutes } = JSON.parse(loginData);
    const now = Date.now();

    const diffMinutes = (now - time) / 1000 / 60;
    if (diffMinutes >= expiresInMinutes) {
      await AsyncStorage.clear(); // имитируем logout
      console.log('🔴 User session expired (background check)');
    }

    return BackgroundFetchResult.NewData;
  } catch (e) {
    console.error('❌ Background task error:', e);
    return BackgroundFetchResult.NewData;
  }
});

export const registerBackgroundTask = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.log('⚠️ Background fetch is disabled');
      return;
    }

    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60, // every 1 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Background task registered');
  } catch (err) {
    console.error('Failed to register background task:', err);
  }
};
