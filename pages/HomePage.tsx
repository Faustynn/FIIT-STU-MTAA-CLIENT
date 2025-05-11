import React, { useEffect, useState, useRef } from 'react';
import { YStack, XStack, H1, Text, Theme, ScrollView, View, Spinner, Button } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Linking, Image, AppState, AppStateStatus } from 'react-native';
import User from '../components/User';
import { useTranslation } from "react-i18next";
import '../utils/i18n';
import sseService from '../services/sseService';
import notificationService, { NewsModel } from '../services/NotificationService';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}


type HomePageProps = {
  navigation: NavigationProp<any>;
};

const openWebLink = (url: string) => {
  Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
};

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [news, setNews] = useState<NewsModel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // ask for notification permissions
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowDisplayInCarPlay: true,
              allowCriticalAlerts: true,
              provideAppNotificationSettings: true,
              allowProvisional: true,
            },
          });
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Error getting permission for notifications');
          return;
        }

        console.log('Permissions for notif. granted');
      } catch (error) {
        console.error('Err while requesting notification permissions:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  // notification service and listener
  useEffect(() => {
    const initNotifications = async () => {
      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      await notificationService.initialize();

      const count = await notificationService.getBadgeCountAsync();
      setBadgeCount(count);

      notificationListener.current = notificationService.addNotificationReceivedListener(
        notification => {
          const newsId = notification.request.content.data?.newsId;
          console.log(`Received notification for news ID: ${newsId}`);
        }
      );

      responseListener.current = notificationService.addNotificationResponseReceivedListener(
        response => {
          const newsId = response.notification.request.content.data?.newsId;
          console.log(`User tapped on notification for news ID: ${newsId}`);
        }
      );

      // debug
      try {
        let token = null;
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (projectId) {
          token = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
        } else {
          token = await Notifications.getExpoPushTokenAsync();
        }

        if (token) {
          setPushToken(token.data);
          console.log('Push token for this device:', token.data);
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    };

    initNotifications();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
      subscription.remove();
    };
  }, []);


  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground');
      await notificationService.resetBadgeCount();
      setBadgeCount(0);

      // Reconnect to SSE if disconnected
      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        sseService.connectToSSEServer();
      }
    } else if (
      appState.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      console.log('App has gone to the background');
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    const fetchAndParseUser = async () => {
      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          setHasData(true);

          if (storedUser.isAdmin) {
            setIsAdmin(storedUser.isAdmin());
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setHasData(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndParseUser();
  }, []);

  // Connect to SSE when we load screen
  useFocusEffect(
    React.useCallback(() => {
      const newsListener = (newsList: NewsModel[]) => {
        setNews(newsList);
      };

      const connectionListener = (status: ConnectionStatus) => {
        setConnectionStatus(status);
      };

      sseService.addNewsListener(newsListener);
      sseService.addConnectionListener(connectionListener);
      notificationService.addNewsUpdateHandler(newsListener);
      notificationService.addConnectionStatusHandler(connectionListener);

      // Connect to SSE server
      sseService.connectToSSEServer();

      // Clean if we leave screen
      return () => {
        sseService.removeNewsListener(newsListener);
        sseService.removeConnectionListener(connectionListener);
        notificationService.removeNewsUpdateHandler(newsListener);
        notificationService.removeConnectionStatusHandler(connectionListener);
      };
    }, [])
  );

  // clear badge count
  const handleClearBadges = async () => {
    await notificationService.resetBadgeCount();
    setBadgeCount(0);
  };

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = isDarkMode ? '#1E2129' : '#F5F5F5';
  const linkTextColor = isDarkMode ? '#79E3A5' : '$blue600';
  const statusColors = {
    [ConnectionStatus.CONNECTED]: '#4CAF50',
    [ConnectionStatus.CONNECTING]: '#FFC107',
    [ConnectionStatus.DISCONNECTED]: '#9E9E9E',
    [ConnectionStatus.ERROR]: '#F44336'
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$4">
        {/* Header */}
        <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
          <H1 fontSize={24} fontWeight="bold" color={headerTextColor}>
            UNIMAP
          </H1>
          <XStack alignItems="center" space="$2">
            <YStack alignItems="flex-end">
              {hasData ? (
                <>
                  <Text color={subTextColor} fontSize={10}>@{user?.login}</Text>
                  <Text color={headerTextColor} fontWeight="bold">{user?.getFullName()}</Text>
                </>
              ) : (
                <Text color={subTextColor} fontSize={10}>@guest</Text>
              )}
            </YStack>
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              {badgeCount > 0 && (
                <View
                  position="absolute"
                  top={-5}
                  right={-5}
                  width={18}
                  height={18}
                  borderRadius={9}
                  backgroundColor="#FF4136"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={1}
                >
                  <Text color="white" fontSize={10} fontWeight="bold">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              )}
              {hasData && user?.getAvatarBase64() ? (
                <Image
                  source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <Text>😏</Text>
              )}
            </View>
          </XStack>
        </XStack>
        {!hasData && (
          <YStack alignItems="center" justifyContent="center" flex={1}>
            <Text color={subTextColor} fontSize={16}>
              No data found. Showing default content.
            </Text>
          </YStack>
        )}

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          padding="$4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* status for admins */}
          {isAdmin && (
            <YStack marginBottom="$3">
              <XStack space="$2" alignItems="center" justifyContent="space-between" marginBottom="$2">
                <Text color={subTextColor}>Status: </Text>
                <Text color={statusColors[connectionStatus]}>
                  {connectionStatus === ConnectionStatus.CONNECTED ? t('connected') :
                    connectionStatus === ConnectionStatus.CONNECTING ? t('connecting') :
                      connectionStatus === ConnectionStatus.DISCONNECTED ? t('disconnected') :
                        t('connection_error')}
                </Text>
              </XStack>

              {badgeCount > 0 && (
                <Button
                  backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                  color={headerTextColor}
                  onPress={handleClearBadges}
                  marginBottom="$2"
                >
                  {t('clear_badges')} ({badgeCount})
                </Button>
              )}
            </YStack>
          )}

          {/* News Section */}
          <XStack alignItems="center" marginBottom="$3" justifyContent="space-between">
            <XStack alignItems="center">
              <MaterialIcons name="article" size={20} color={subTextColor} style={{ marginRight: 8 }} />
              <Text fontSize={18} color={subTextColor}>
                {t('news_upd')}
              </Text>
            </XStack>

            {/* Status for admins */}
            {isAdmin && (
              connectionStatus === ConnectionStatus.CONNECTED ? (
                <Text fontSize={12} color={statusColors[ConnectionStatus.CONNECTED]}>
                  {t('live')}
                </Text>
              ) : connectionStatus === ConnectionStatus.CONNECTING ? (
                <XStack alignItems="center" space="$1">
                  <Spinner size="small" color={statusColors[ConnectionStatus.CONNECTING]} />
                  <Text fontSize={12} color={statusColors[ConnectionStatus.CONNECTING]}>
                    {t('connecting')}
                  </Text>
                </XStack>
              ) : (
                <Text fontSize={12} color={statusColors[ConnectionStatus.DISCONNECTED]}>
                  {t('offline')}
                </Text>
              )
            )}
          </XStack>

          {/* Connection Status Message for admins*/}
          {isAdmin && connectionStatus === ConnectionStatus.CONNECTING && (
            <YStack alignItems="center" marginBottom="$3">
              <Text color={statusColors[ConnectionStatus.CONNECTING]} fontSize={14}>
                {t('attempting_connection')}
              </Text>
            </YStack>
          )}

          {/* Loading circle for all users */}
          {connectionStatus === ConnectionStatus.DISCONNECTED && (
            <YStack alignItems="center" marginBottom="$3">
              <XStack alignItems="center" space="$2">
                <Spinner size="small" color={statusColors[ConnectionStatus.CONNECTING]} />
                <Text color={statusColors[ConnectionStatus.DISCONNECTED]} fontSize={14}>
                  {isAdmin ? t('trying_to_connect') : t('loading_news')}
                </Text>
              </XStack>
            </YStack>
          )}

          {/* News Cards */}
          {news.length === 0 ? (
            <YStack
              backgroundColor={cardBackgroundColor}
              borderRadius="$2"
              padding="$4"
              marginBottom="$3"
              width="100%"
              alignItems="center"
            >
              <MaterialIcons name="info-outline" size={24} color={subTextColor} style={{ marginBottom: 8 }} />
              <Text fontSize={16} color={subTextColor} textAlign="center">
                {connectionStatus === ConnectionStatus.CONNECTED
                  ? t('no_news_found')
                  : t('offline_mode')}
              </Text>
            </YStack>
          ) : (
            news.map((newsItem) => (
              <YStack key={newsItem.id} backgroundColor={cardBackgroundColor} borderRadius="$2" padding="$4" marginBottom="$3" width="100%">
                <Text fontSize={20} fontWeight="bold" color={headerTextColor} marginBottom="$2">
                  {newsItem.title}
                </Text>
                <Text fontSize={16} color={subTextColor} lineHeight={22}>
                  {newsItem.content}
                </Text>
                <Text fontSize={12} color={subTextColor} position="absolute" top={8} right={8}>
                  {new Date(newsItem.date_of_creation).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}
                </Text>
                <MaterialIcons name="location-on" size={20} color={subTextColor} style={{ marginTop: 8, alignSelf: 'flex-end' }} />
              </YStack>
            ))
          )}

          {/* Utilities Section */}
          <XStack alignItems="center" marginTop="$4" marginBottom="$3">
            <MaterialIcons name="build" size={20} color={subTextColor} style={{ marginRight: 8 }} />
            <Text fontSize={18} color={subTextColor}>
              {t('utils')}
            </Text>
          </XStack>

          {/* FIIT Discord */}
          <YStack
            backgroundColor={cardBackgroundColor}
            borderRadius="$2"
            padding="$4"
            marginBottom="$3"
            width="100%"
            onPress={() => openWebLink("https://discord.gg/dX48acpNS8")}
          >
            <Text fontSize={20} fontWeight="bold" color={linkTextColor} marginBottom="$2">
              {t('fiit_dis')}
            </Text>
            <Text fontSize={16} color={subTextColor}>
              {t('fiit_dis_desc')}
            </Text>
          </YStack>

          {/* FX-com */}
          <YStack
            backgroundColor={cardBackgroundColor}
            borderRadius="$2"
            padding="$4"
            marginBottom="$3"
            width="100%"
            onPress={() => openWebLink("https://www.notion.so/FX-com-54cdb158085e4377b832ece310a5603d")}
          >
            <Text fontSize={20} fontWeight="bold" color={linkTextColor} marginBottom="$2">
              {t('fx_com')}
            </Text>
            <Text fontSize={16} color={subTextColor}>
              {t('fx_com_desc')}
            </Text>
          </YStack>

          {/* Mladost Guide */}
          <YStack
            backgroundColor={cardBackgroundColor}
            borderRadius="$2"
            padding="$4"
            marginBottom="$3"
            width="100%"
            onPress={() => openWebLink("https://protective-april-ef1.notion.site/SD-Mladost-abe968a31d404360810b53acbbb357cc")}
          >
            <Text fontSize={20} fontWeight="bold" color={linkTextColor} marginBottom="$2">
              {t('mladost')}
            </Text>
            <Text fontSize={16} color={subTextColor}>
              {t('mladost_desc')}
            </Text>
          </YStack>

          {/* FIIT Telegram */}
          <YStack
            backgroundColor={cardBackgroundColor}
            borderRadius="$2"
            padding="$4"
            marginBottom="$3"
            width="100%"
            onPress={() => openWebLink("https://t.me/fiitstu")}
          >
            <Text fontSize={20} fontWeight="bold" color={linkTextColor} marginBottom="$2">
              {t('fiit_tg')}
            </Text>
            <Text fontSize={16} color={subTextColor}>
              {t('fiit_tg_desc')}
            </Text>
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
};

export default HomePage;