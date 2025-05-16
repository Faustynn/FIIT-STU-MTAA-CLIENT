import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { YStack, XStack, H1, Text, Theme, ScrollView, View, Spinner, Button } from "tamagui";
import { useTheme, getFontSizeValue } from '../components/SettingsController';
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Linking, Image, AppState, useWindowDimensions, AppStateStatus, Platform, Alert } from 'react-native';

import User from '../components/User';
import '../utils/i18n';
import sseService from '../services/sseService';
import notificationService, { NewsModel } from '../services/NotificationService';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

// Cash all data
const cache = {
  user: null as User | null,
  news: [] as NewsModel[],
  userLocation: null as Location.LocationObject | null,
  pushToken: null as string | null,
};

enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

type HomePageProps = {
  navigation: NavigationProp<any>;
};

// Вынесем утилиты наружу для предотвращения повторного создания функций
const openWebLink = (url: string) => {
  Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
};

// Открыть карты с направлениями
const openMapsWithDirections = (destLatitude: number, destLongitude: number, userLatitude?: number, userLongitude?: number) => {
  let url = '';

  // Если пользователь поделился местоположением
  if (userLatitude !== undefined && userLongitude !== undefined) {
    if (Platform.OS === 'ios') {
      url = `maps://app?saddr=${userLatitude},${userLongitude}&daddr=${destLatitude},${destLongitude}`;
    } else {
      url = `google.navigation:q=${destLatitude},${destLongitude}&origin=${userLatitude},${userLongitude}`;
    }
  } else { // Если не поделился, просто направление к месту назначения
    if (Platform.OS === 'ios') {
      url = `maps://app?daddr=${destLatitude},${destLongitude}`;
    } else {
      url = `google.navigation:q=${destLatitude},${destLongitude}`;
    }
  }

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLatitude},${destLongitude}`;
        return Linking.openURL(fallbackUrl);
      }
    })
    .catch(err => console.error('An error occurred', err));
};

// check coords
const hasValidCoordinates = (newsItem: NewsModel) => {
  return newsItem.coordinates !== undefined &&
    newsItem.coordinates !== null &&
    newsItem.coordinates.latitude !== undefined &&
    newsItem.coordinates.longitude !== undefined &&
    newsItem.coordinates.latitude !== 0 &&
    newsItem.coordinates.longitude !== 0;
};


const utilities = [
  {
    key: 'fiit_dis',
    url: 'https://discord.gg/dX48acpNS8',
  },
  {
    key: 'fx_com',
    url: 'https://www.notion.so/FX-com-54cdb158085e4377b832ece310a5603d',
  },
  {
    key: 'mladost',
    url: 'https://protective-april-ef1.notion.site/SD-Mladost-abe968a31d404360810b53acbbb357cc',
  },
  {
    key: 'fiit_tg',
    url: 'https://t.me/fiitstu'
  },
];

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);

  const isDarkMode = theme === 'dark';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [user, setUser] = useState<User | null>(() => cache.user as User | null);
  const [isLoading, setIsLoading] = useState(!cache.user);
  const [hasData, setHasData] = useState(!!cache.user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [news, setNews] = useState<NewsModel[]>(() => cache.news as NewsModel[]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [pushToken, setPushToken] = useState<string | null>(() => cache.pushToken);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(() => cache.userLocation);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string | null>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const firstUpdateRef = useRef<boolean>(true);

  // cash notif.
  const [notificationInitialized, setNotificationInitialized] = useState(false);

  const styles = useMemo(() => ({
    backgroundColor: highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50',
    headerTextColor: highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600',
    subTextColor: highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800',
    cardBackgroundColor: highContrast ? '#000000' : isDarkMode ? '#1E2129' : '$F5F5F5',
    linkTextColor: highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '$blue600',
    statusColors: {
      [ConnectionStatus.CONNECTED]: '#4CAF50',
      [ConnectionStatus.CONNECTING]: '#FFC107',
      [ConnectionStatus.DISCONNECTED]: '#9E9E9E',
      [ConnectionStatus.ERROR]: '#F44336'
    }
  }), [highContrast, isDarkMode]);

  // Lazy loading for permissions notf.
  const requestNotificationPermissions = useCallback(async () => {
    if (notificationInitialized) return;

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
      setNotificationInitialized(true);
    } catch (error) {
      console.error('Err while requesting notification permissions:', error);
    }
  }, [notificationInitialized]);


  // Lazy loading geolocation permiss.
  const requestLocationPermissions = useCallback(async (forceRequest = false) => {
    if (cache.userLocation && !forceRequest) {
      setUserLocation(cache.userLocation);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
        cache.userLocation = location; // Сохраняем в кеш
        console.log('User location acquired');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  }, []);

  // Lazy loading notif.
  const initNotifications = useCallback(async () => {
    if (notificationInitialized) return;

    // notif. settings
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

    // liseners setings
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

    if (!pushToken) {
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
          cache.pushToken = token.data; // save token to cash
          console.log('Push token acquired');
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    }

    setNotificationInitialized(true);
  }, [notificationInitialized, pushToken]);


  // check app. state
  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground');
      if (notificationInitialized) {
        await notificationService.resetBadgeCount();
        setBadgeCount(0);
      }

      if (locationPermissionStatus === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(location);
          cache.userLocation = location;
        } catch (error) {
          console.error('Error updating user location:', error);
        }
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        sseService.connectToSSEServer();
      }
    }

    appState.current = nextAppState;
  }, [connectionStatus, locationPermissionStatus, notificationInitialized]);

  // tak user from cash
  useEffect(() => {
    const fetchAndParseUser = async () => {
      // Если пользователь уже есть в кеше, не загружаем повторно
      if (cache.user) {
        setUser(cache.user as User);
        setHasData(true);
        setIsAdmin(cache.user.isAdmin());
        setIsLoading(false);
        return;
      }

      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          cache.user = storedUser; // Сохраняем в кеш
          setHasData(true);
          setIsAdmin(storedUser.isAdmin());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setHasData(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseUser();
  }, []);

  // init app observer
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();

      // Очищаем слушатели уведомлений при размонтировании
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleAppStateChange]);

  // connect to sse
  useFocusEffect(
    useCallback(() => {
      const newsListener = (newsList: NewsModel[]) => {
        setNews(newsList);
        cache.news = newsList; // Сохраняем в кеш
      };

      const connectionListener = (status: ConnectionStatus) => {
        setConnectionStatus(status);
      };

      // Инициализируем уведомления только при необходимости
      if (isAdmin || hasData) {
        initNotifications();
        requestNotificationPermissions();
      }

      // Запрашиваем геопозицию только если администратор
      // или если есть новости с координатами
      if (isAdmin || news.some(hasValidCoordinates)) {
        requestLocationPermissions();
      }

      sseService.addNewsListener(newsListener);
      sseService.addConnectionListener(connectionListener);
      notificationService.addNewsUpdateHandler(newsListener);
      notificationService.addConnectionStatusHandler(connectionListener);

      // Подключаемся к SSE серверу
      sseService.connectToSSEServer();

      return () => {
        sseService.removeNewsListener(newsListener);
        sseService.removeConnectionListener(connectionListener);
        notificationService.removeNewsUpdateHandler(newsListener);
        notificationService.removeConnectionStatusHandler(connectionListener);
      };
    }, [isAdmin, hasData, initNotifications, requestLocationPermissions, requestNotificationPermissions])
  );

  const handleClearBadges = useCallback(async () => {
    await notificationService.resetBadgeCount();
    setBadgeCount(0);
  }, []);
  const handleLocationPress = useCallback(async (newsItem: NewsModel) => {
    if (!hasValidCoordinates(newsItem)) {
      Alert.alert(t('no_location'), t('no_location_message'), [{ text: t('ok'), style: 'default' }]);
      return;
    }

    try {
      let currentLocation = userLocation;

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

      // Получаем текущее местоположение только если разрешение получено
      if (locationPermissionStatus === 'granted') {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(currentLocation);
        cache.userLocation = currentLocation; // Обновляем кеш
      }

      // Открываем карты с направлениями
      if (newsItem.coordinates) {
        openMapsWithDirections(
          newsItem.coordinates.latitude,
          newsItem.coordinates.longitude,
          currentLocation?.coords.latitude,
          currentLocation?.coords.longitude
        );
      }
    } catch (error) {
      console.error('Error handling location press:', error);

      // Если не удалось получить местоположение, просто показываем место назначения
      if (hasValidCoordinates(newsItem) && newsItem.coordinates) {
        openMapsWithDirections(
          newsItem.coordinates.latitude,
          newsItem.coordinates.longitude
        );
      }
    }
  }, [locationPermissionStatus, t, userLocation]);

  // utility list
  const utilityList = useMemo(() => {
    return utilities.map(util => ({
      title: t(util.key),
      desc: t(`${util.key}_desc`),
      url: util.url
    }));
  }, [t]);

  // loading screen
  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={styles.backgroundColor}>
        <Spinner size="large" color={styles.headerTextColor} />
      </YStack>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack
        flex={1}
        backgroundColor={styles.backgroundColor}
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
            <H1 fontSize={textSize + 14} fontWeight="bold" color={styles.headerTextColor}>
              UNIMAP
            </H1>
            {hasData ? (
              isLandscape ? (
                <YStack alignItems="flex-start">
                  <Text color={styles.subTextColor} fontSize={textSize - 2}>
                    @{user?.login}
                  </Text>
                  <Text color={styles.headerTextColor} fontWeight="bold" fontSize={textSize}>
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
                        zIndex={1}
                      >
                        <Text color="white" fontSize={10} fontWeight="bold">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: `data:image/png;base64,${user?.getAvatarBase64()}` }}
                      style={{ width: 60, height: 60, borderRadius: 30 }}
                    />
                  </View>
                </YStack>
              ) : (
                <XStack alignItems="center" space="$2">
                  <YStack alignItems="flex-end">
                    <Text color={styles.subTextColor} fontSize={textSize - 2}>
                      @{user?.login}
                    </Text>
                    <Text color={styles.headerTextColor} fontWeight="bold" fontSize={textSize}>
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
                        zIndex={1}
                      >
                        <Text color="white" fontSize={10} fontWeight="bold">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: `data:image/png;base64,${user?.getAvatarBase64()}` }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  </View>
                </XStack>
              )
            ) : (
              <Text color={styles.subTextColor} fontSize={textSize - 2}>
                @guest
              </Text>
            )}
          </XStack>

          {!hasData && (
            <YStack alignItems="center" justifyContent="center" flex={1}>
              <Text color={styles.subTextColor} fontSize={textSize}>
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
              paddingTop: isLandscape ? 5 : 15,
              paddingBottom: 24,
              paddingLeft: isLandscape ? 19 : 0,
            }}>

            {/* status for admins */}
            {isAdmin && (
              <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" marginBottom="$2">
                <Text fontSize={12} color={locationPermissionStatus === 'granted' ? '#4CAF50' : '#F44336'}>
                  {locationPermissionStatus === 'granted'
                    ? t('location_enabled')
                    : t('location_disabled')}
                </Text>
                <XStack space="$2" alignItems="center">
                  <Text color={styles.subTextColor}>Status: </Text>
                  <Text color={styles.statusColors[connectionStatus]}>
                    {connectionStatus === ConnectionStatus.CONNECTED ? t('connected') :
                      connectionStatus === ConnectionStatus.CONNECTING ? t('connecting') :
                        connectionStatus === ConnectionStatus.DISCONNECTED ? t('disconnected') :
                          t('connection_error')}
                  </Text>
                </XStack>
                {badgeCount > 0 && (
                  <Button
                    backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                    color={styles.headerTextColor}
                    onPress={handleClearBadges}
                  >
                    <Text>
                      {t('clear_badges')} ({badgeCount})
                    </Text>
                  </Button>
                )}
              </XStack>
            )}

            {/* News section */}
            <XStack alignItems="center" marginBottom="$3" justifyContent="space-between">
              <XStack alignItems="center">
                <MaterialIcons
                  name="article"
                  size={20}
                  color={styles.subTextColor}
                  style={{ marginRight: 8 }}
                />
                <Text fontSize={textSize + 2} color={styles.subTextColor}>
                  {t('news_upd')}
                </Text>
              </XStack>

              {/* Status indicators for admins */}
              {isAdmin && (
                connectionStatus === ConnectionStatus.CONNECTED ? (
                  <Text fontSize={12} color={styles.statusColors[ConnectionStatus.CONNECTED]}>
                    {t('live')}
                  </Text>
                ) : connectionStatus === ConnectionStatus.CONNECTING ? (
                  <XStack alignItems="center" space="$1">
                    <Spinner size="small" color={styles.statusColors[ConnectionStatus.CONNECTING]} />
                    <Text fontSize={12} color={styles.statusColors[ConnectionStatus.CONNECTING]}>
                      {t('connecting')}
                    </Text>
                  </XStack>
                ) : (
                  <Text fontSize={12} color={styles.statusColors[ConnectionStatus.DISCONNECTED]}>
                    {t('offline')}
                  </Text>
                )
              )}
            </XStack>

            {/* Connection Status Message for admins*/}
            {isAdmin && connectionStatus === ConnectionStatus.CONNECTING && (
              <YStack alignItems="center" marginBottom="$3">
                <Text color={styles.statusColors[ConnectionStatus.CONNECTING]} fontSize={14}>
                  {t('attempting_connection')}
                </Text>
              </YStack>
            )}

            {/* Loading circle for all users */}
            {connectionStatus === ConnectionStatus.DISCONNECTED && (
              <YStack alignItems="center" marginBottom="$3">
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color={styles.statusColors[ConnectionStatus.CONNECTING]} />
                  <Text color={styles.statusColors[ConnectionStatus.DISCONNECTED]} fontSize={14}>
                    {isAdmin ? t('trying_to_connect') : t('loading_news')}
                  </Text>
                </XStack>
              </YStack>
            )}

            {/* News Cards */}
            {news.length === 0 ? (
              <YStack
                backgroundColor={styles.cardBackgroundColor}
                borderRadius="$2"
                padding="$4"
                marginBottom="$3"
                width="100%"
                alignItems="center"
              >
                <MaterialIcons name="info-outline" size={24} color={styles.subTextColor} style={{ marginBottom: 8 }} />
                <Text fontSize={textSize} color={styles.subTextColor} textAlign="center">
                  {connectionStatus === ConnectionStatus.CONNECTED
                    ? t('no_news_found')
                    : t('offline_mode')}
                </Text>
              </YStack>
            ) : (
              news.map((newsItem) => (
                <YStack key={newsItem.id} backgroundColor={styles.cardBackgroundColor} borderRadius="$2" padding="$4" marginBottom="$3" width="100%">
                  <Text fontSize={textSize + 4} fontWeight="bold" color={styles.headerTextColor} marginBottom="$2">
                    {newsItem.title}
                  </Text>
                  <Text fontSize={textSize} color={styles.subTextColor} lineHeight={textSize + 6}>
                    {newsItem.content}
                  </Text>
                  <Text fontSize={12} color={styles.subTextColor} position="absolute" top={8} right={8}>
                    {new Date(newsItem.date_of_creation).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}
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
                      <Text fontSize={10} color={highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '#3366BB'} marginLeft={2}>
                        {t('get_directions')}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              ))
            )}

            {/* Utils */}
            <XStack alignItems="center" marginTop="$4" marginBottom="$3">
              <MaterialIcons
                name="build"
                size={20}
                color={styles.subTextColor}
                style={{ marginRight: 8 }}
              />
              <Text fontSize={textSize + 2} color={styles.subTextColor}>
                {t('utils')}
              </Text>
            </XStack>

            {/* utils list */}
            {utilityList.map((item, i) => (
              <YStack
                key={i}
                backgroundColor={styles.cardBackgroundColor}
                borderRadius="$2"
                padding="$4"
                marginBottom="$3"
                width="100%"
                onPress={() => openWebLink(item.url)}>
                <Text
                  fontSize={textSize + 4}
                  fontWeight="bold"
                  color={styles.linkTextColor}
                  marginBottom="$2">
                  {item.title}
                </Text>
                <Text fontSize={textSize} color={styles.subTextColor}>
                  {item.desc}
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