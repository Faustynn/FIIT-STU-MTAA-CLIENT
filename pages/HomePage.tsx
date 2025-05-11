import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Image, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { YStack, XStack, H1, Text, Theme, ScrollView, View, Spinner } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import '../utils/i18n';

export interface News {
  id: number | string;
  title: string;
  description: string;
}

type HomePageProps = {
  navigation: NavigationProp<any>;
};

const openWebLink = (url: string) => {
  Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
};

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize } = useTheme();
  const textSize = getFontSizeValue(fontSize);

  const isDarkMode = theme === 'dark';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchAndParseUser = async () => {
      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseUser();
  }, []);

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = isDarkMode ? '#1E2129' : '$F5F5F5';
  const linkTextColor = isDarkMode ? '#79E3A5' : '$blue600';

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
                    justifyContent="center">
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
                    justifyContent="center">
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
            <XStack alignItems="center" marginBottom="$3">
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

            <YStack
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
                {t('fiit_dis')}
              </Text>
              <Text fontSize={textSize} color={subTextColor} lineHeight={textSize + 6}>
                {t('fiit_dis_desc')}
              </Text>
            </YStack>

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
