import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { YStack, Input, Button, Text, Theme, XStack, H1 } from 'tamagui';

import { useTheme } from '../components/SettingsController';
import {
  sendEmailConfirmationRequest,
  sendCodeConfirmationRequest,
  sendNewPasswordRequest,
} from '../services/apiService';

const ForgotPasswordPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDarkMode = theme === 'dark';

  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    try {
      if (step === 1) {
        if (!email) {
          setError(t('entr_email'));
          return;
        }
        const success = await sendEmailConfirmationRequest(email);
        if (success) {
          setError(null);
          setStep(2);
        } else {
          setError(t('email_error'));
        }
      } else if (step === 2) {
        if (!verificationCode) {
          setError(t('entr_code'));
          return;
        }
        const success = await sendCodeConfirmationRequest(email, verificationCode);
        if (success) {
          setError(null);
          setStep(3);
        } else {
          setError(t('code_error'));
        }
      } else if (step === 3) {
        if (newPassword !== confirmPassword) {
          setError(t('pass_mismatch'));
          return;
        }
        const success = await sendNewPasswordRequest(email, newPassword);
        if (success) {
          setError(null);
          navigation.navigate('Login');
        } else {
          setError(t('reset_error'));
        }
      }
    } catch (err) {
      setError(t('general_error'));
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
        backgroundColor={isDarkMode ? '#191C22' : '$gray50'}>
        <XStack alignItems="center" marginBottom="$4" space="$0">
          <Button
            icon={<MaterialIcons name="chevron-left" size={24} color="black" />}
            onPress={handleGoBack}
            backgroundColor="transparent"
            color={headerTextColor}
          />
          <H1 fontSize={32} fontWeight="bold" color={isDarkMode ? '#FFFFFF' : '$blue600'}>
            UNIMAP
          </H1>
          <Image source={require('../assets/icon.png')} style={{ width: 80, height: 80 }} />
        </XStack>

        <YStack
          backgroundColor={isDarkMode ? '#262A35' : '#F5F5F5'}
          borderRadius="$4"
          elevation="$4"
          padding="$6"
          width="100%"
          maxWidth={400}>
          <Text
            fontSize={20}
            fontWeight="600"
            color={isDarkMode ? '#FFFFFF' : '$gray800'}
            marginBottom="$4"
            textAlign="center">
            {step === 1 && t('entr_email')}
            {step === 2 && t('entr_code')}
            {step === 3 && t('set_new_pass')}
          </Text>

          <YStack space="$4">
            {step === 1 && (
              <Input
                placeholder={t('email_field')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
              />
            )}

            {step === 2 && (
              <Input
                placeholder={t('verif_code_field')}
                value={verificationCode}
                onChangeText={setVerificationCode}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
              />
            )}

            {step === 3 && (
              <>
                <Input
                  placeholder={t('new_pass')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  backgroundColor="transparent"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                />
                <Input
                  placeholder={t('conf_new_pass')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  backgroundColor="transparent"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                />
              </>
            )}

            {error && (
              <Text color="$red10" fontSize={14} textAlign="center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleNext}
              backgroundColor="#79E3A5"
              hoverStyle={{ backgroundColor: '#66D294' }}
              color="#191C22"
              padding="$3"
              borderRadius="$2"
              marginTop="$4">
              {step === 3 ? t('rst_pass_btn') : t('next')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default ForgotPasswordPage;
