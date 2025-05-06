import React, { useEffect, useState } from "react";
import { YStack, H1, Theme, XStack, Text, View, Button, Input, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "react-native";
import { useTranslation } from "react-i18next";
import User from "../components/User";
import { buyPremium, sendRegistrationRequest } from "../services/apiService";

type ProfilePageProps = {
  navigation: NavigationProp<any>;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleLogout = async () => {
    await AsyncStorage.removeItem('ACCESS_TOKEN');
    await AsyncStorage.removeItem('REFRESH_TOKEN');
    await AsyncStorage.removeItem('USER_DATA');
    navigation.navigate('Login');
  };

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


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
        console.error(t('error_fetching_user'), error);
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

  const [email, setEmail] = useState(t(''));
  const [password, setPassword] = useState('');

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  const handlePremium = async () => {
    const isChanged = await buyPremium(user?.login || 'none');

    if (isChanged) {
      setSuccessMessage(t('buy_prem_success'));
      setError(null);
    } else {
      setError(t('buy_prem_failed'));
      setSuccessMessage(null);
    }
  };

  const handleEmailChange = async () => {

  };

  const handledeleteComments = async () => {

  };

  const handlePicture = async () => {

  };

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
                <Text color={subTextColor} fontSize={10}>@{t('guest')}</Text>
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
              {t('no_data_found')}
            </Text>
          </YStack>
        )}

        {/* Main Content */}
        <YStack flex={1} paddingHorizontal="$4" space="$5">
          {/* Profile Title */}
          <Text fontSize={32} fontWeight="bold" color={headerTextColor}>
            {t('profile')}
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
                {hasData && user?.getAvatarBase64() ? (
                  <Image
                    source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                    style={{ width: 100, height: 100, borderRadius: 20 }}
                  />
                ) : (
                  <Text>😏</Text>
                )}
              </View>

              {/* Change Pic Button */}
              <Button
                size="$2"
                fontSize={12}
                paddingHorizontal="$2"
                backgroundColor="#3D4049"
                color="#FFFFFF"
                onPress={handlePicture}
              >
                {t('change_pic')}
              </Button>
            </YStack>

            {/* User Info */}
            <YStack flex={1} space="$4">
              <YStack>
                {hasData ? (
                  <>
                    <Text color={headerTextColor} fontSize={22} fontWeight="bold">{user?.getFullName()}</Text>
                    <Text color={subTextColor} fontSize={14}>@{user?.login}</Text>
                  </>
                ) : (
                  <Text color={subTextColor} fontSize={10}>@{t('guest')}</Text>
                )}
              </YStack>

              {/* Premium Button */}
              {!user?.isPremium && (
                <Button
                  backgroundColor={primaryButtonColor}
                  color="#000000"
                  fontWeight="bold"
                  paddingVertical="$2"
                  borderRadius="$4"
                  onPress={handlePremium}
                >
                  {t('b_premium')}
                </Button>
              )}
            </YStack>
          </XStack>

          {/* Email Section */}
          <YStack space="$2" marginTop="$2">
            <Text color={subTextColor} fontSize={14}>{t('email')}</Text>
            <XStack space="$2" alignItems="center">
            <Input
              flex={1}
              value={email}
              onChangeText={setEmail}
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
              onPress={handleEmailChange}
            >
              {t('change_btn')}
            </Button>
            </XStack>
          </YStack>

          {/* Password Section */}
          <YStack space="$2">
            <Text color={subTextColor} fontSize={14}>{t('change_password')}</Text>
            <Button
              backgroundColor={secondaryButtonColor}
              color="#000000"
              fontWeight="bold"
              paddingVertical="$3"
              paddingHorizontal="$4"
              borderRadius="$2"
              onPress={() => navigation.navigate('ForgotPasswordPage')}
            >
              {t('change_pass_btn')}
            </Button>
          </YStack>

          {/* Privacy Section */}
          <YStack space="$3" marginTop="$2">
            <Text color={subTextColor} fontSize={14}>{t('privacy')}</Text>
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
                {t('logout')}
              </Button>
              <Button
                flex={1}
                backgroundColor={secondaryButtonColor}
                color="#000000"
                fontWeight="bold"
                paddingVertical="$3"
                borderRadius="$2"
                onPress={handledeleteComments}
              >
                {t('d_comm')}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default ProfilePage;