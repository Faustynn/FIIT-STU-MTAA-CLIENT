import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from 'tamagui';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme, Platform } from 'react-native';
import 'react-native-match-media-polyfill';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendFCMTokenToServer, checkAuthOnStartup, startTokenRefreshTask } from './services/apiService';

// components
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './components/SettingsController';
import config from './tamagui.config';

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    OutfitBlack: require('./assets/fonts/Outfit-Black.ttf'),
    OutfitBold: require('./assets/fonts/Outfit-Bold.ttf'),
    OutfitExtraBold: require('./assets/fonts/Outfit-ExtraBold.ttf'),
    OutfitExtraLight: require('./assets/fonts/Outfit-ExtraLight.ttf'),
    OutfitLight: require('./assets/fonts/Outfit-Light.ttf'),
    OutfitMedium: require('./assets/fonts/Outfit-Medium.ttf'),
    OutfitRegular: require('./assets/fonts/Outfit-Regular.ttf'),
    OutfitSemiBold: require('./assets/fonts/Outfit-SemiBold.ttf'),
    OutfitThin: require('./assets/fonts/Outfit-Thin.ttf'),
  });

  const [appReady, setAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние авторизации
  const systemTheme = useColorScheme();

  // Autologin impl.
  useEffect(() => {
    const initializeAuth = async () => {
      const isLoggedIn = await checkAuthOnStartup();
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn) {
        startTokenRefreshTask(); // Запуск задачи обновления токенов
      }
    };

    initializeAuth();
  }, []);

  // Notif. settings
  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.setBadgeCountAsync(0);
      await AsyncStorage.setItem('BADGE_COUNT', '0');

      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
        }

        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
      } else {
        await Notifications.requestPermissionsAsync();
      }

      // take FSM
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await sendFCMTokenToServer(token);
    };

    setupNotifications();
  }, []);

  // active notif.
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'New notification',
          body: remoteMessage.notification?.body || 'You have new message!',
          data: remoteMessage.data,
        },
        trigger: null,
      });
    });

    return unsubscribe;
  }, []);

  // background notif.
  useEffect(() => {
    const backgroundMessageHandler = async (remoteMessage: any) => {
      console.log('Message handled in the background!', remoteMessage);

      try {
        const badgeCountStr = (await AsyncStorage.getItem('BADGE_COUNT')) || '0';
        let badgeCount = parseInt(badgeCountStr, 10) + 1;

        await AsyncStorage.setItem('BADGE_COUNT', badgeCount.toString());
        await Notifications.setBadgeCountAsync(badgeCount);

        // local notif.
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title || 'New notification',
            body: remoteMessage.notification?.body || 'You have new message!',
            data: remoteMessage.data,
            badge: badgeCount,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error handling background notification:', error);
      }
    };

    messaging().setBackgroundMessageHandler(backgroundMessageHandler);
  }, []);

  // Expo Notifications
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
      }),
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return null;
  }

  if (!isAuthenticated) {

    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={systemTheme || 'light'}>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </TamaguiProvider>
  );
};

export default App;