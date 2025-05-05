import React, { useEffect, useState } from "react";
import { YStack, H1, Theme, XStack, Text, View, Button, Input, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "react-native";
import User from "../components/User";

type ProfilePageProps = {
  navigation: NavigationProp<any>;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {

  const handleLogout = async () => {
    await AsyncStorage.removeItem('ACCESS_TOKEN');
    await AsyncStorage.removeItem('REFRESH_TOKEN');
    await AsyncStorage.removeItem('USER_DATA');
    navigation.navigate('Login');
  };

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
  const inputBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const primaryButtonColor = '#79E3A5';
  const secondaryButtonColor = '#B3C7EE';
  const dangerButtonColor = '#FF617D';

  const [email, setEmail] = useState('Write your email here');
  const [password, setPassword] = useState('');

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0">
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
        <YStack flex={1} paddingHorizontal="$4" space="$5">
          {/* Profile Title */}
          <Text fontSize={32} fontWeight="bold" color={headerTextColor}>
            Profile
          </Text>

          {/* Profile Info */}
          <XStack space="$4" alignItems="flex-start">
            <YStack alignItems="center" space="$2">
              <View
                width={100}
                height={100}
                borderRadius={50}
                backgroundColor="#FFFFFF"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                borderWidth={1}
                borderColor="#DDDDDD"
              >
                <Text fontSize={50}>😊</Text>
              </View>

              {/* Change Pic Button */}
              <Button
                size="$2"
                fontSize={12}
                paddingHorizontal="$2"
                backgroundColor="#3D4049"
                color="#FFFFFF"
              >
                Change pic
              </Button>
            </YStack>

            {/* User Info */}
            <YStack flex={1} space="$4">
              <YStack>
                <Text fontSize={22} fontWeight="bold" color={headerTextColor}>Nazar Meredov</Text>
                <Text fontSize={14} color={subTextColor}>@xmeredov</Text>
              </YStack>

              {/* Premium Button */}
              <Button
                backgroundColor={primaryButtonColor}
                color="#000000"
                fontWeight="bold"
                paddingVertical="$2"
                borderRadius="$4"
              >
                BUY PREMIUM
              </Button>
            </YStack>
          </XStack>

          {/* Email Section */}
          <YStack space="$2" marginTop="$2">
            <Text color={subTextColor} fontSize={14}>Email</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              backgroundColor={inputBackgroundColor}
              borderRadius={8}
              padding="$3"
              color={headerTextColor}
            />
          </YStack>

          {/* Password Section */}
          <YStack space="$2">
            <Text color={subTextColor} fontSize={14}>Password (Hold the field to see)</Text>
            <XStack space="$2" alignItems="center">
              <Input
                flex={1}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                backgroundColor={inputBackgroundColor}
                borderRadius={8}
                padding="$3"
                color={headerTextColor}
              />
              <Button
                backgroundColor={secondaryButtonColor}
                color="#000000"
                fontWeight="bold"
                paddingVertical="$3"
                paddingHorizontal="$4"
                borderRadius="$2"
              >
                Change
              </Button>
            </XStack>
          </YStack>

          {/* Privacy Section */}
          <YStack space="$3" marginTop="$2">
            <Text color={subTextColor} fontSize={14}>Privacy</Text>
            <XStack space="$3">
              <Button
                flex={1}
                backgroundColor={dangerButtonColor}
                color="#FFFFFF"
                fontWeight="bold"
                paddingVertical="$3"
                borderRadius="$2"
                onPress={handleLogout}
              >
                Log Out
              </Button>
              <Button
                flex={1}
                backgroundColor={secondaryButtonColor}
                color="#000000"
                fontWeight="bold"
                paddingVertical="$3"
                borderRadius="$2"
              >
                Delete all feedbacks
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default ProfilePage;