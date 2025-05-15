import React, { useState } from 'react';
import { YStack, Input, Button, Text, Theme, XStack, H1 } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { Image } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppNavigator";
import { sendRegistrationRequest } from "../services/apiService";
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from "@expo/vector-icons";

type RegistrateProps = {
  navigation: NavigationProp<AppStackParamList>;
};

const RegistratePage: React.FC<RegistrateProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDarkMode = theme === 'dark';

  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';

  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError(t('pass_mismatch'));
      return;
    }
    const isRegistered = await sendRegistrationRequest(login, name, email, password);

    if (isRegistered) {
      setSuccessMessage(t('reg_success'));
      setError(null);

      // Clear fields
      setName('');
      setLogin('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(t('reg_failed'));
      setSuccessMessage(null);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Theme name={theme}>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$4"
        backgroundColor={isDarkMode ? '#191C22' : '$gray50'}
      >
        <XStack alignItems="center" marginBottom="$4" space="$0">
          <Button
            icon={<MaterialIcons name="chevron-left" size={24} color={isDarkMode ? '#79E3A5' : 'black'} />}
            onPress={handleGoBack}
            backgroundColor="transparent"
            color={headerTextColor}
          />
          <H1
            fontSize={32}
            fontWeight="bold"
            color={isDarkMode ? '#FFFFFF' : '$blue600'}
          >
            UNIMAP
          </H1>
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 80, height: 80 }}
          />
        </XStack>

        <YStack
          backgroundColor={isDarkMode ? '#262A35' : '#F5F5F5'}
          borderRadius="$4"
          elevation="$4"
          padding="$6"
          width="100%"
          maxWidth={400}
        >
          <Text
            fontSize={20}
            fontWeight="600"
            color={isDarkMode ? '#FFFFFF' : '$gray800'}
            marginBottom="$4"
            textAlign="center"
          >
            {t('registration')}
          </Text>

          <YStack space="$3">
            <XStack alignItems="center">
              <MaterialIcons style={{ marginRight: 8 }} name="person" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('name')}
                value={name}
                onChangeText={setName}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                flex={1}
              />
            </XStack>
            <XStack alignItems="center">
              <MaterialIcons style={{ marginRight: 8 }} name="account-circle" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('login')}
                value={login}
                onChangeText={setLogin}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                flex={1}
              />
            </XStack>
            <XStack alignItems="center">
              <MaterialIcons style={{ marginRight: 8 }} name="email" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('email_field')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                flex={1}
              />
            </XStack>
            <XStack alignItems="center">
              <MaterialIcons style={{ marginRight: 8 }} name="lock" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('pass')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                flex={1}
              />
            </XStack>
            <XStack alignItems="center">
              <MaterialIcons style={{ marginRight: 8 }} name="lock-outline" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('conf_pass')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                flex={1}
              />
            </XStack>

            {error && (
              <Text color="$red10" fontSize={14} textAlign="center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleRegister}
              backgroundColor={isDarkMode ? '#79E3A5' : '#0000FF'}
              hoverStyle={{ backgroundColor: isDarkMode ? '#66D294' : '#0000CC' }}
              color={isDarkMode ? '#191C22' : '#FFFFFF'}
              marginTop="$4">
              {t('reg')}
            </Button>

            {successMessage && (
              <Text color="$green10" fontSize={14} textAlign="center">
                {successMessage}
              </Text>
            )}
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default RegistratePage;