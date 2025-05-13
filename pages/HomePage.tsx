import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Image,
  AppState,
  useWindowDimensions,
  AppStateStatus,
  Platform,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { YStack, XStack, H1, Text, Theme, ScrollView, View, Spinner, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import '../utils/i18n';
import notificationService, { NewsModel } from '../services/NotificationService';
import sseService from '../services/sseService';

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

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
  Linking.openURL(url).catch((err) => console.log('[ERROR] Failed to open URL:', err));
};

//open maps with directions
const openMapsWithDirections = (
  destLatitude: number,
  destLongitude: number,
  userLatitude?: number,
  userLongitude?: number
) => {
  let url = '';

  // user share location
  if (userLatitude !== undefined && userLongitude !== undefined) {
    if (Platform.OS === 'ios') {
      url = `maps://app?saddr=${userLatitude},${userLongitude}&daddr=${destLatitude},${destLongitude}`;
    } else {
      url = `google.navigation:q=${destLatitude},${destLongitude}&origin=${userLatitude},${userLongitude}`;
    }
  } else {
    // user dont share location make only navigation to dest
    if (Platform.OS === 'ios') {
      url = `maps://app?daddr=${destLatitude},${destLongitude}`;
    } else {
      url = `google.navigation:q=${destLatitude},${destLongitude}`;
    }
  }

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLatitude},${destLongitude}`;
        return Linking.openURL(fallbackUrl);
      }
    })
    .catch((err) => console.log('[ERROR] An error occurred', err));
};

const hasValidCoordinates = (newsItem: NewsModel) => {
  // check coords
  return (
    newsItem.coordinates !== undefined &&
    newsItem.coordinates !== null &&
    newsItem.coordinates.latitude !== undefined &&
    newsItem.coordinates.longitude !== undefined &&
    newsItem.coordinates.latitude !== 0 &&
    newsItem.coordinates.longitude !== 0
  );
};

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);

  const isDarkMode = theme === 'dark';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [user, setUser] = useState<User>(null as any);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [news, setNews] = useState<NewsModel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string | null>(null);
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
        console.log('[ERROR] Err while requesting notification permissions:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  // Request location permissions and get user location
  useEffect(() => {
    const requestLocationPermissions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionStatus(status);

        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(location);
          console.log('User location acquired:', location.coords);
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.log('[ERROR] Error requesting location permissions:', error);
      }
    };

    requestLocationPermissions();
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
        (notification) => {
          const newsId = notification.request.content.data?.newsId;
          console.log(`Received notification for news ID: ${newsId}`);
        }
      );

      responseListener.current = notificationService.addNotificationResponseReceivedListener(
        (response) => {
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
            projectId,
          });
        } else {
          token = await Notifications.getExpoPushTokenAsync();
        }

        if (token) {
          setPushToken(token.data);
          console.log('Push token for this device:', token.data);
        }
      } catch (error) {
        console.log('[ERROR] Error getting push token:', error);
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
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground');
      await notificationService.resetBadgeCount();
      setBadgeCount(0);

      // Update user location when app comes to foreground
      if (locationPermissionStatus === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(location);
        } catch (error) {
          console.log('[ERROR] Error updating user location:', error);
        }
      }

      // Reconnect to SSE if disconnected
      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        sseService.connectToSSEServer();
      }
    } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
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
        console.log('[ERROR] Error fetching user:', error);
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

  // Handler for location icon press
  const handleLocationPress = async (newsItem: NewsModel) => {
    // Check if news have valid coords
    if (!hasValidCoordinates(newsItem)) {
      Alert.alert(t('no_location'), t('no_location_message'), [
        { text: t('ok'), style: 'default' },
      ]);
      return;
    }

    try {
      let currentLocation = userLocation; // take coords

      if (locationPermissionStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionStatus(status);

        if (status !== 'granted') {
          if (newsItem.coordinates) {
            openMapsWithDirections(newsItem.coordinates.latitude, newsItem.coordinates.longitude);
          }
          return;
        }
      }

      // Get curr. location
      currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(currentLocation);

      // Open maps with directions
      if (newsItem.coordinates) {
        openMapsWithDirections(
          newsItem.coordinates.latitude,
          newsItem.coordinates.longitude,
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    } catch (error) {
      console.log('[ERROR] Error handling location press:', error);

      if (hasValidCoordinates(newsItem) && newsItem.coordinates) {
        openMapsWithDirections(newsItem.coordinates.latitude, newsItem.coordinates.longitude);
      }
    }
  };

  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#1E2129' : '$F5F5F5';
  const linkTextColor = highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '$blue600';
  const statusColors = {
    [ConnectionStatus.CONNECTED]: '#4CAF50',
    [ConnectionStatus.CONNECTING]: '#FFC107',
    [ConnectionStatus.DISCONNECTED]: '#9E9E9E',
    [ConnectionStatus.ERROR]: '#F44336',
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack
        flex={1}
        backgroundColor={backgroundColor}
        paddingTop="$6"
        paddingBottom="$2"
        paddingLeft={isLandscape ? 45 : '$4'}
        paddingRight={isLandscape ? 24 : '$4'}
        flexDirection={isLandscape ? 'row' : 'column'}>
        {/* Left panel */}
        <YStack>
          <XStack
            justifyContent="space-between"
            alignItems={isLandscape ? 'flex-start' : 'center'}
            flexDirection={isLandscape ? 'column' : 'row'}
            gap="$4">
            <H1 fontSize={textSize + 10} fontWeight="bold" color={headerTextColor}>
              UNIMAP
            </H1>
            {hasData ? (
              isLandscape ? (
                <YStack alignItems="flex-start">
                  <Text color={subTextColor} fontSize={textSize - 2}>
                    @{user?.login}
                  </Text>
                  <Text color={headerTextColor} fontWeight="bold" fontSize={textSize}>
                    {user?.getFullName()}
                  </Text>
                  <View
                    marginTop="$2"
                    width={60}
                    height={60}
                    borderRadius={30}
                    backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                    alignItems="center"
                    justifyContent="center"
                    position="relative">
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
                        zIndex={1}>
                        <Text color="white" fontSize={10} fontWeight="bold">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                      style={{ width: 60, height: 60, borderRadius: 30 }}
                    />
                  </View>
                </YStack>
              ) : (
                <XStack alignItems="center" space="$2">
                  <YStack alignItems="flex-end">
                    <Text color={subTextColor} fontSize={textSize - 2}>
                      @{user?.login}
                    </Text>
                    <Text color={headerTextColor} fontWeight="bold" fontSize={textSize}>
                      {user?.getFullName()}
                    </Text>
                  </YStack>
                  <View
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                    alignItems="center"
                    justifyContent="center"
                    position="relative">
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
                        zIndex={1}>
                        <Text color="white" fontSize={10} fontWeight="bold">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  </View>
                </XStack>
              )
            ) : (
              <Text color={subTextColor} fontSize={textSize - 2}>
                @guest
              </Text>
            )}
          </XStack>

          {/* Location Permission Status (for admins) */}
          {isAdmin && (
            <XStack justifyContent="flex-end" paddingHorizontal="$4" marginBottom="$2">
              <Text
                fontSize={12}
                color={locationPermissionStatus === 'granted' ? '#4CAF50' : '#F44336'}>
                {locationPermissionStatus === 'granted'
                  ? t('location_enabled')
                  : t('location_disabled')}
              </Text>
            </XStack>
          )}

          {!hasData && (
            <YStack alignItems="center" justifyContent="center" flex={1}>
              <Text color={subTextColor} fontSize={textSize}>
                No data found. Showing default content.
              </Text>
            </YStack>
          )}
        </YStack>

        {/* Right panel */}
        <YStack flex={isLandscape ? 3 : 2}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: isLandscape ? 5 : 56,
              paddingBottom: 24,
              paddingLeft: isLandscape ? 19 : 0,
            }}>

            {/* status for admins */}
            {isAdmin && (
              <YStack marginBottom="$3">
                <XStack
                  space="$2"
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom="$2">
                  <Text color={subTextColor}>Status: </Text>
                  <Text color={statusColors[connectionStatus]}>
                    {connectionStatus === ConnectionStatus.CONNECTED
                      ? t('connected')
                      : connectionStatus === ConnectionStatus.CONNECTING
                        ? t('connecting')
                        : connectionStatus === ConnectionStatus.DISCONNECTED
                          ? t('disconnected')
                          : t('connection_error')}
                  </Text>
                </XStack>

                {badgeCount > 0 && (
                  <Button
                    backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                    color={headerTextColor}
                    onPress={handleClearBadges}
                    marginBottom="$2">
                    {t('clear_badges')} ({badgeCount})
                  </Button>
                )}
              </YStack>
            )}

            {/* News section */}
            <XStack alignItems="center" marginBottom="$3" justifyContent="space-between">
              <XStack alignItems="center">
                <MaterialIcons
                  name="article"
                  size={20}
                  color={subTextColor}
                  style={{ marginRight: 8 }}
                />
                <Text fontSize={textSize + 2} color={subTextColor}>
                  {t('news_upd')}
                </Text>
              </XStack>

              {/* Status indicators for admins */}
              {isAdmin &&
                (connectionStatus === ConnectionStatus.CONNECTED ? (
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
                ))}
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
                alignItems="center">
                <MaterialIcons
                  name="info-outline"
                  size={24}
                  color={subTextColor}
                  style={{ marginBottom: 8 }}
                />
                <Text fontSize={textSize} color={subTextColor} textAlign="center">
                  {connectionStatus === ConnectionStatus.CONNECTED
                    ? t('no_news_found')
                    : t('offline_mode')}
                </Text>
              </YStack>
            ) : (
              news.map((newsItem) => (
                <YStack
                  key={newsItem.id}
                  backgroundColor={cardBackgroundColor}
                  borderRadius="$2"
                  padding="$4"
                  marginBottom="$3"
                  width="100%">
                  <Text
                    fontSize={textSize + 4}
                    fontWeight="bold"
                    color={headerTextColor}
                    marginBottom="$2">
                    {newsItem.title}
                  </Text>
                  <Text fontSize={textSize} color={subTextColor} lineHeight={textSize + 6}>
                    {newsItem.content}
                  </Text>
                  <Text fontSize={12} color={subTextColor} position="absolute" top={8} right={8}>
                    {new Date(newsItem.date_of_creation).toLocaleDateString(undefined, {
                      year: '2-digit',
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </Text>

                  {/* show icon if we have valid coords */}
                  {hasValidCoordinates(newsItem) && (
                    <XStack alignItems="center" justifyContent="flex-end" marginTop={8}>
                      <MaterialIcons
                        name="location-on"
                        size={24}
                        color={highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '#3366BB'}
                        onPress={() => handleLocationPress(newsItem)}
                      />
                      <Text
                        fontSize={10}
                        color={highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '#3366BB'}
                        marginLeft={2}>
                        {t('get_directions')}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              ))
            )}

            <XStack alignItems="center" marginTop="$4" marginBottom="$3">
              <MaterialIcons
                name="build"
                size={20}
                color={subTextColor}
                style={{ marginRight: 8 }}
              />
              <Text fontSize={textSize + 2} color={subTextColor}>
                {t('utils')}
              </Text>
            </XStack>

            {[
              {
                title: t('fiit_dis'),
                desc: t('fiit_dis_desc'),
                url: 'https://discord.gg/dX48acpNS8',
              },
              {
                title: t('fx_com'),
                desc: t('fx_com_desc'),
                url: 'https://www.notion.so/FX-com-54cdb158085e4377b832ece310a5603d',
              },
              {
                title: t('mladost'),
                desc: t('mladost_desc'),
                url: 'https://protective-april-ef1.notion.site/SD-Mladost-abe968a31d404360810b53acbbb357cc',
              },
              { title: t('fiit_tg'), desc: t('fiit_tg_desc'), url: 'https://t.me/fiitstu' },
            ].map(({ title, desc, url }, i) => (
              <YStack
                key={i}
                backgroundColor={cardBackgroundColor}
                borderRadius="$2"
                padding="$4"
                marginBottom="$3"
                width="100%"
                onPress={() => openWebLink(url)}>
                <Text
                  fontSize={textSize + 4}
                  fontWeight="bold"
                  color={linkTextColor}
                  marginBottom="$2">
                  {title}
                </Text>
                <Text fontSize={textSize} color={subTextColor}>
                  {desc}
                </Text>
              </YStack>
            ))}
          </ScrollView>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default HomePage;
