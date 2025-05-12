import { NavigationProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { YStack, H1, H2, Input, Button, Text, Theme, XStack, View } from 'tamagui';

import { ComboBox } from '../components/ComboBox';
import { useTheme } from '../components/SettingsController';
import OAuthButtons from '../components/oAuthButtons';
import { sendAuthenticationRequest, sendTempLogin, getUserIdByEmail } from '../services/apiService';

import '../utils/i18n';

const LoginPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const isDarkMode = theme === 'dark';
  const [language, setLanguage] = useState(i18n.language || 'en');
  const timeToLive = 1;

  const handleLogin = async () => {
    try {
      const response = await sendAuthenticationRequest(email, password);
      if (response) {
        const id = await getUserIdByEmail(email);
        if (id !== null) {
          await sendTempLogin(id, timeToLive);
        }
        navigation.navigate('Main');
      } else {
        console.error(t('login_error'));
      }
    } catch (error) {
      console.error(t('login_error'), error);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };
  const languages = [
    { label: t('en_lang'), value: 'en' },
    { label: t('sk_lang'), value: 'sk' },
    { label: t('ua_lang'), value: 'ua' },
  ];

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = isDarkMode ? '#2a2f3b' : '#F0F0F0';
  const labelColor = isDarkMode ? '#A0A7B7' : '#555555';

  return (
    <Theme name={theme}>
      <View
        style={[
          styles.settingCard,
          { backgroundColor: cardColor, position: 'absolute', top: 16, right: 16, zIndex: 1 },
        ]}>
        <YStack space="$2">
          <ComboBox
            value={language}
            onValueChange={handleLanguageChange}
            items={languages}
            placeholder={t('select_language')}
            labelColor={labelColor}
            textColor={textColor}
          />
        </YStack>
      </View>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$4"
        backgroundColor={isDarkMode ? '#191C22' : '$gray50'}>
        {/* Header */}
        <XStack alignItems="center" marginBottom="$4" space="$0">
          <Image source={require('../assets/icon.png')} style={{ width: 80, height: 80 }} />
          <H1 fontSize={32} fontWeight="bold" color={isDarkMode ? '#FFFFFF' : '$blue600'}>
            UNIMAP
          </H1>
        </XStack>

        <YStack
          backgroundColor={isDarkMode ? '#262A35' : '#F5F5F5'}
          borderRadius="$4"
          elevation="$4"
          padding="$6"
          width="100%"
          maxWidth={400}>
          <H2
            fontSize={20}
            fontWeight="600"
            color={isDarkMode ? '#FFFFFF' : '$gray800'}
            marginBottom="$4"
            textAlign="center">
            {t('login')}
          </H2>

          <YStack space="$4">
            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor={isDarkMode ? '#262A35' : '$gray300'}
              borderRadius="$2"
              paddingHorizontal="$2">
              <MaterialIcons name="email" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('email_field')}
                value={email}
                onChangeText={setEmail}
                flex={1}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                focusStyle={{
                  borderColor: isDarkMode ? '#79E3A5' : '$blue500',
                  borderWidth: 2,
                }}
              />
            </XStack>

            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor={isDarkMode ? '#262A35' : '$gray300'}
              borderRadius="$2"
              paddingHorizontal="$2">
              <MaterialIcons name="lock" size={20} color={isDarkMode ? '#79E3A5' : '$blue600'} />
              <Input
                placeholder={t('pass_field')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                flex={1}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
                focusStyle={{
                  borderColor: isDarkMode ? '#79E3A5' : '$blue500',
                  borderWidth: 2,
                }}
              />
            </XStack>

            {/* OAuth buttons */}
            <OAuthButtons isDarkMode={isDarkMode} />

            <XStack justifyContent="space-between" alignItems="center" width="100%">
              <Text
                textAlign="left"
                fontSize={10}
                fontWeight="500"
                color={isDarkMode ? '#79E3A5' : '$blue600'}
                hoverStyle={{ color: isDarkMode ? '#66D294' : '$blue800' }}
                cursor="pointer"
                onPress={() => navigation.navigate('ForgotPasswordPage')}>
                {t('fgt_pass')}
              </Text>

              <XStack alignItems="center" space="$1">
                <Text
                  textAlign="right"
                  fontSize={10}
                  fontWeight="500"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}>
                  {t('dnt_hv_acc')}
                </Text>
                <Text
                  textAlign="right"
                  fontSize={10}
                  fontWeight="500"
                  color={isDarkMode ? '#79E3A5' : '$blue600'}
                  hoverStyle={{ color: isDarkMode ? '#66D294' : '$blue800' }}
                  cursor="pointer"
                  onPress={() => navigation.navigate('RegistratePage')}>
                  {t('reg')}
                </Text>
              </XStack>
            </XStack>

            <Button
              onPress={handleLogin}
              backgroundColor="#79E3A5"
              hoverStyle={{ backgroundColor: '#66D294' }}
              color="#191C22"
              padding="$3"
              borderRadius="$2">
              {t('login')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  settingCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
});

export default LoginPage;
