import React from 'react';
import { YStack, H1, H2, Input, Button, Text, Theme, XStack } from 'tamagui';
import { useTheme } from '../components/SettingsController';
import { Image } from 'react-native';
import { NavigationProp } from "@react-navigation/native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LoginPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const isDarkMode = theme === 'dark';


  return (
    <Theme name={theme}>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$4"
        backgroundColor={isDarkMode ? '#191C22' : '$gray50'}
      >
        {/* Header */}
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
          <H2
            fontSize={20}
            fontWeight="600"
            color={isDarkMode ? '#FFFFFF' : '$gray800'}
            marginBottom="$4"
            textAlign="center"
          >
            Log In
          </H2>

          <YStack space="$4">
            <XStack alignItems="center" borderWidth={1} borderColor={isDarkMode ? '#262A35' : '$gray300'} borderRadius="$2" paddingHorizontal="$2">
              <MaterialIcons
                name="email"
                size={20}
                color={isDarkMode ? '#79E3A5' : '$blue600'}
              />
              <Input
                placeholder="Write your login or email"
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

            <XStack alignItems="center" borderWidth={1} borderColor={isDarkMode ? '#262A35' : '$gray300'} borderRadius="$2" paddingHorizontal="$2">
              <MaterialIcons
                name="lock"
                size={20}
                color={isDarkMode ? '#79E3A5' : '$blue600'}
              />
              <Input
                placeholder="Write your password"
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

            <XStack justifyContent="space-between" alignItems="center" width="100%">
              <Text
                textAlign="left"
                fontSize={10}
                fontWeight="500"
                color={isDarkMode ? '#79E3A5' : '$blue600'}
                hoverStyle={{ color: isDarkMode ? '#66D294' : '$blue800' }}
                cursor="pointer"
                onPress={() => navigation.navigate('ForgotPasswordPage')}
              >
                Forgot Password?
              </Text>

              <XStack alignItems="center" space="$1">
                <Text
                  textAlign="right"
                  fontSize={10}
                  fontWeight="500"
                  color={isDarkMode ? '#FFFFFF' : '$gray800'}
                >
                  Don't have an account?
                </Text>
                <Text
                  textAlign="right"
                  fontSize={10}
                  fontWeight="500"
                  color={isDarkMode ? '#79E3A5' : '$blue600'}
                  hoverStyle={{ color: isDarkMode ? '#66D294' : '$blue800' }}
                  cursor="pointer"
                  onPress={() => navigation.navigate('RegistratePage')}
                >
                  Register!
                </Text>
              </XStack>
            </XStack>

            <Button
              onPress={() => navigation.navigate('Main')}
              backgroundColor="#79E3A5"
              hoverStyle={{ backgroundColor: '#66D294' }}
              color="#191C22"
              padding="$3"
              borderRadius="$2"
            >
              Log In
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default LoginPage;