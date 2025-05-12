import React, { useState } from "react";
import { Button, XStack } from 'tamagui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useGoogleAuth, useFacebookAuth } from '../utils/oAuthUtil';
import { AppStackParamList } from '../navigation/AppNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Alert } from 'react-native';

const OAuthButtons: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const { request: googleRequest, handleGoogleSignIn } = useGoogleAuth();
  const { request: facebookRequest, handleFacebookSignIn } = useFacebookAuth();

  const handleGoogleLogin = async () => {
    if (!googleRequest) {
      Alert.alert('Error', 'Google authentication is not ready');
      return;
    }

    setIsLoading(true);
    try {
      const success = await handleGoogleSignIn();
      if (success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', 'Unable to log in with Google');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!facebookRequest) {
      Alert.alert('Error', 'Facebook authentication is not ready');
      return;
    }

    setIsLoading(true);
    try {
      const success = await handleFacebookSignIn();
      if (success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', 'Unable to log in with Facebook');
      }
    } catch (error) {
      console.error('Facebook Login Error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle = {
    backgroundColor: isDarkMode ? '#262A35' : '#F5F5F5',
    color: isDarkMode ? '#79E3A5' : '#000000',
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
  };

  return (
    <XStack space="$2" flexDirection="column">
      <Button
        style={buttonStyle}
        onPress={handleGoogleLogin}
        disabled={isLoading || !googleRequest}
      >
        <MaterialIcons
          name={'login'}
          size={24}
          color={isDarkMode ? '#79E3A5' : '#000000'}
        />
        {isLoading ? 'Loading...' : 'Google'}
      </Button>
      <Button
        style={buttonStyle}
        onPress={handleFacebookLogin}
        disabled={isLoading || !facebookRequest}
      >
        <MaterialIcons
          name={'facebook'}
          size={24}
          color={isDarkMode ? '#79E3A5' : '#000000'}
        />
        {isLoading ? 'Loading...' : 'Facebook'}
      </Button>
    </XStack>
  );
};

export default OAuthButtons;