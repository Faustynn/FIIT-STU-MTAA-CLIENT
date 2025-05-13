import React from 'react';
import { Button, XStack } from 'tamagui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useGoogleAuth, useFacebookAuth } from '../utils/oAuthUtil';
import { AppStackParamList } from '../navigation/AppNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';

const OAuthButtons: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  const { loginWithFacebook, isLoading: isFacebookLoading } = useFacebookAuth();

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      navigation.navigate('Main');
    }
  };

  const handleFacebookLogin = async () => {
    const success = await loginWithFacebook();
    if (success) {
      navigation.navigate('Main');
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
        disabled={isGoogleLoading}
      >
        <MaterialCommunityIcons name={'shop'} size={24} color={isDarkMode ? '#79E3A5' : '#000000'} />
        {isGoogleLoading ? 'Loading...' : 'Google'}
      </Button>
      <Button
        style={buttonStyle}
        onPress={handleFacebookLogin}
        disabled={isFacebookLoading}
      >
        <MaterialCommunityIcons name={'facebook'} size={24} color={isDarkMode ? '#79E3A5' : '#000000'} />
        {isFacebookLoading ? 'Loading...' : 'Facebook'}
      </Button>
    </XStack>
  );
};

export default OAuthButtons;