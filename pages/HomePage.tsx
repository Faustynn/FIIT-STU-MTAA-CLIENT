import React, { useEffect, useState } from 'react';
import { YStack, XStack, H1, Text, Theme, Button, ScrollView, View, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Linking, Image } from 'react-native';
import User from '../components/User';

export interface News {
  id: number | string;
  title: string;
  description: string;
}


type HomePageProps = {
  navigation: NavigationProp<any>;
};

const openWebLink = (url: string) => {
  Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
};

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

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
        console.error("Error fetching user:", error);
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
  const cardBackgroundColor = isDarkMode ? '#1E2129' : '#F5F5F5';
  const linkTextColor = isDarkMode ? '#79E3A5' : '$blue600';

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
          <XStack alignItems="center" marginBottom="$3">
            <MaterialIcons name="article" size={20} color={subTextColor} style={{ marginRight: 8 }} />
            <Text fontSize={18} color={subTextColor}>
              Latest News and Updates:
            </Text>
          </XStack>

          {/* Example NewsCard */}
          <YStack
            backgroundColor={cardBackgroundColor}
            borderRadius="$2"
            padding="$4"
            marginBottom="$3"
            width="100%"
          >
            <Text fontSize={20} fontWeight="bold" color={headerTextColor} marginBottom="$2">
              Title of the thing
            </Text>
            <Text fontSize={16} color={subTextColor} lineHeight={22}>
              Text describing the thing so much precisely as it is only possible...
            </Text>
          </YStack>

          {/* Utilities Section */}
          <XStack alignItems="center" marginTop="$4" marginBottom="$3">
            <MaterialIcons name="build" size={20} color={subTextColor} style={{ marginRight: 8 }} />
            <Text fontSize={18} color={subTextColor}>
              Useful Utilities
            </Text>
          </XStack>

          {/* Example UtilityLink */}

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
              FIIT Discord
            </Text>
            <Text fontSize={16} color={subTextColor}>
              Official Discord of STU FIIT, provided by teachers and enthusiastic students
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
              Fx - com
            </Text>
            <Text fontSize={16} color={subTextColor}>
              Notion page created by a few students to help others. Here, you can read and download materials for various subjects
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
              Mladost Guide
            </Text>
            <Text fontSize={16} color={subTextColor}>
              Notion page for students who want to move into or already live in the Mladost dormitory, where you can find many useful tips
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
              FIIT Telegram
            </Text>
            <Text fontSize={16} color={subTextColor}>
              Telegram channel for foreign students, provided by enthusiastic students
            </Text>
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
};

export default HomePage;