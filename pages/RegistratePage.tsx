import React, { useState } from 'react';
import { YStack, Input, Button, Text, Theme, XStack, H1 } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { Image } from "react-native";

const RegistratePage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    // TODO: send registration request
    console.log({ name, login, email, password });
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
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 80, height: 80 }}
          />
          <H1
            fontSize={32}
            fontWeight="bold"
            color={isDarkMode ? '#FFFFFF' : '$blue600'}
          >
            UNIMAP
          </H1>
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
            Registration
          </Text>

          <YStack space="$4">
            <Input
              placeholder="Name"
              value={name}
              onChangeText={setName}
              backgroundColor="transparent"
              color={isDarkMode ? '#FFFFFF' : '$gray800'}
            />
            <Input
              placeholder="Login"
              value={login}
              onChangeText={setLogin}
              backgroundColor="transparent"
              color={isDarkMode ? '#FFFFFF' : '$gray800'}
            />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              backgroundColor="transparent"
              color={isDarkMode ? '#FFFFFF' : '$gray800'}
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              backgroundColor="transparent"
              color={isDarkMode ? '#FFFFFF' : '$gray800'}
            />
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              backgroundColor="transparent"
              color={isDarkMode ? '#FFFFFF' : '$gray800'}
            />

            {error && (
              <Text color="$red10" fontSize={14} textAlign="center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleRegister}
              backgroundColor="#79E3A5"
              hoverStyle={{ backgroundColor: '#66D294' }}
              color="#191C22"
              padding="$3"
              borderRadius="$2"
            >
              Register
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default RegistratePage;