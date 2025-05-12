import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, useRef } from 'react';
import { TamaguiProvider } from 'tamagui';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme, Platform, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-match-media-polyfill';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPushTokenToServer, checkAuthOnStartup, startTokenRefreshTask } from './services/apiService';
import NotificationService from './services/NotificationService';
import config from './tamagui.config';
import { saveAppClosureTime, initOfflineNotifications } from './services/OfflineNotification';

// Components
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './components/SettingsController';

// Prevent splash screens from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
});

const BACKGROUND_TASK = 'background-task-news';

// background task
TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    console.log('Background task initiated');

    const isAuthenticated = await AsyncStorage.getItem('AUTH_TOKEN');
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping news fetch');
      return;
    }

    const response = await fetch('http://192.168.0.119:8080/api/news/latest');
    if (!response.ok) {
      console.log('Failed to fetch news in background');
      return;
    }

    const latestNews = await response.json();
    NotificationService.checkForNewNews(latestNews);

    console.log('Background task completed successfully');
  } catch (error) {
    console.error('Error in background task:', error);
  }
});

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const systemTheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Register background task for app closure notifications
  useEffect(() => {
    const setupOfflineNotifications = async () => {
      try {
        await initOfflineNotifications();
      } catch (error) {
        console.error('❌ Error initializing offline notifications:', error);
      }
    };

    setupOfflineNotifications();
  }, []);

  // Track app state for  time
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if ((appState.current.match(/active/) && nextAppState.match(/inactive|background/)) || (appState.current.match(/background/) && nextAppState.match(/inactive/))) {
        await saveAppClosureTime();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Init NotificationService
  useEffect(() => {
    const initNotificationService = async () => {
      await NotificationService.initialize();
    };

    initNotificationService();

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  // Start background task
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for saved auth state
        const isLoggedIn = await checkAuthOnStartup();
        console.log('Auth check result:', isLoggedIn);

        setIsAuthenticated(isLoggedIn);
        setInitialRoute(isLoggedIn ? 'Main' : 'Login');

        if (isLoggedIn) {
          startTokenRefreshTask();
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setIsAuthenticated(false);
        setInitialRoute('Login');
      }
    };

    initializeAuth();
  }, []);

  // Request notif. permissions
  useEffect(() => {
    const resetBadgeCount = async () => {
      await Notifications.setBadgeCountAsync(0);
      await AsyncStorage.setItem('BADGE_COUNT', '0');
    };

    resetBadgeCount();

    const requestNotificationPermissionsAndToken = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowProvisional: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const projectId = process.env.EXPO_PROJECT_ID || 'your-expo-project-id';
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

        console.log('Expo push token:', tokenData.data);
        await AsyncStorage.setItem('PUSH_TOKEN', tokenData.data);
        await sendPushTokenToServer(tokenData.data);
      }
    };

    requestNotificationPermissionsAndToken();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground');
        resetBadgeCount();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to the background');
      }

      appState.current = nextAppState;
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
    };
  }, []);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!appReady || isAuthenticated === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={systemTheme || 'light'}>
          <ThemeProvider>
            <NavigationContainer>
              <AppNavigator initialRoute={initialRoute} setIsAuthenticated={setIsAuthenticated} />
            </NavigationContainer>
          </ThemeProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;