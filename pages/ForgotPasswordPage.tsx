import React, { useState } from 'react';
import { YStack, Input, Button, Text, Theme, XStack, H1 } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from '@react-navigation/native';
import { Image } from "react-native";
import { sendEmailConfirmationRequest, sendCodeConfirmationRequest, sendNewPasswordRequest } from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from "@expo/vector-icons";

const ForgotPasswordPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDarkMode = theme === 'dark';

  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const buttonColor = isDarkMode ? '#79E3A5' : '$blue500';
  const buttonTextColor = isDarkMode ? '#191C22' : '#FFFFFF';
  const backArrowColor = isDarkMode ? '#79E3A5' : 'black';
  const iconColor = isDarkMode ? '#79E3A5' : '$blue500';

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
        backgroundColor={isDarkMode ? '#191C22' : '$gray50'}
      >
        <XStack alignItems="center" marginBottom="$4" space="$0">
          <Button
            icon={<MaterialIcons name="chevron-left" size={24} color={backArrowColor} />}
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
            {step === 1 && t('entr_email')}
            {step === 2 && t('entr_code')}
            {step === 3 && t('set_new_pass')}
          </Text>

          <YStack space="$4">
            {step === 1 && (
              <XStack alignItems="center" width="100%">
                <MaterialIcons name="email" size={24} color={iconColor} style={{ marginRight: 10 }} />
                <Input
                  flex={1}
                  placeholder={t('email_field')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  backgroundColor="transparent"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                />
              </XStack>
            )}

            {step === 2 && (
              <XStack alignItems="center" width="100%">
                <MaterialIcons name="security" size={24} color={iconColor} style={{ marginRight: 10 }} />
                <Input
                  flex={1}
                  placeholder={t('verif_code_field')}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  backgroundColor="transparent"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                />
              </XStack>
            )}

            {step === 3 && (
              <>
                <XStack alignItems="center" width="100%" paddingBottom={"$3"}>
                  <MaterialIcons name="lock" size={24} color={iconColor} style={{ marginRight: 10 }} />
                  <Input
                    flex={1}
                    placeholder={t('new_pass')}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    backgroundColor="transparent"
                    color={isDarkMode ? '#FFFFFF' : '$gray800'}
                  />
                </XStack>
                <XStack alignItems="center" width="100%">
                  <MaterialIcons name="lock-outline" size={24} color={iconColor} style={{ marginRight: 10 }} />
                  <Input
                    flex={1}
                    placeholder={t('conf_new_pass')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    backgroundColor="transparent"
                    color={isDarkMode ? '#FFFFFF' : '$gray800'}
                  />
                </XStack>
              </>
            )}

            {error && (
              <Text color="$red10" fontSize={14} textAlign="center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleNext}
              backgroundColor={buttonColor}
              hoverStyle={{ backgroundColor: isDarkMode ? '#66D294' : '$blue600' }}
              color={buttonTextColor}
              marginTop="$4"
            >
              {step === 3 ? t('rst_pass_btn') : t('next')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default ForgotPasswordPage;