import React, { useState } from 'react';
import { YStack, Input, Button, Text, Theme, XStack, H1 } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from '@react-navigation/native';
import { Image } from "react-native";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { sendEmailConfirmationRequest, sendCodeConfirmationRequest, sendNewPasswordRequest } from '../services/apiService';

const ForgotPasswordPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme } = useTheme();
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
          setError('Please enter your email');
          return;
        }
        const success = await sendEmailConfirmationRequest(email);
        if (success) {
          setError(null);
          setStep(2);
        } else {
          setError('Failed to send verification code. Please try again.');
        }
      } else if (step === 2) {
        if (!verificationCode) {
          setError('Please enter the verification code');
          return;
        }
        const success = await sendCodeConfirmationRequest(email, verificationCode);
        if (success) {
          setError(null);
          setStep(3);
        } else {
          setError('Invalid verification code. Please try again.');
        }
      } else if (step === 3) {
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const success = await sendNewPasswordRequest(email, newPassword);
        if (success) {
          setError(null);
          navigation.navigate('Login');
        } else {
          setError('Failed to reset password. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
            icon={<ChevronLeft size="$1" />}
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
            {step === 1 && 'Enter Your Email'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Set New Password'}
          </Text>

          <YStack space="$4">
            {step === 1 && (
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
              />
            )}

            {step === 2 && (
              <Input
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                backgroundColor="transparent"
                color={isDarkMode ? '#FFFFFF' : '$gray800'}
              />
            )}

            {step === 3 && (
              <>
                <Input
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  backgroundColor="transparent"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                />
                <Input
                  placeholder="Confirm New Password"
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
              marginTop="$4"
            >
              {step === 3 ? 'Reset Password' : 'Next'}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default ForgotPasswordPage;