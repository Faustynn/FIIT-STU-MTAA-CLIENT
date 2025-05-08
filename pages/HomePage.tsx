import React, { useEffect, useState } from 'react';
import { YStack, XStack, H1, Text, Theme, ScrollView, View, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Linking, Image } from 'react-native';
import User from '../components/User';
import { useTranslation } from "react-i18next";
import '../utils/i18n';
import sseService, { ConnectionStatus, NewsModel } from '../services/sseService';

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


  //
  useEffect(() => {const fetchAndParseUser = async () => {
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
  useFocusEffect(React.useCallback(() => {

      const newsListener = (newsList: NewsModel[]) => {
        setNews(newsList);
      };
      const connectionListener = (status: ConnectionStatus) => {
        setConnectionStatus(status);
      };

      sseService.addNewsListener(newsListener);
      sseService.addConnectionListener(connectionListener);
      sseService.connectToSSEServer();

      // Clean if we leave screen
      return () => {
        sseService.removeNewsListener(newsListener);
        sseService.removeConnectionListener(connectionListener);
        sseService.closeConnection();
      };
    }, [])
  );

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
            >
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

          {/* News Cards from SSE */}
          {connectionStatus === ConnectionStatus.CONNECTED && news.length === 0 ? (
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
                {t('no_news_found')}
              </Text>
            </YStack>
          ) : connectionStatus === ConnectionStatus.CONNECTED && news.length > 0 ? (
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
          ) : (
            // if no connection print error message
            <YStack backgroundColor={cardBackgroundColor} borderRadius="$2" padding="$4" marginBottom="$3" width="100%" alignItems="center">
              <MaterialIcons name="error-outline" size={24} color={statusColors[ConnectionStatus.ERROR]} style={{ marginBottom: 8 }} />
              <Text fontSize={20} fontWeight="bold" color={statusColors[ConnectionStatus.ERROR]} marginBottom="$2">
                {t('connection_error')}
              </Text>
              <Text fontSize={16} color={subTextColor} lineHeight={22} textAlign="center">
                {t('connection_error_desc')}
              </Text>
            </YStack>
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