import React from 'react';
import { Button, XStack, Text } from 'tamagui';
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

  return (
    <XStack space={16} justifyContent="space-between" width="100%">
      <Button
        flex={1}
        backgroundColor="#DB4437"
        color="white"
        borderRadius={8}
        padding={10}
        borderWidth={0}
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        disabled={isGoogleLoading}
        onPress={handleGoogleLogin}>
        <XStack space={8} alignItems="center" justifyContent="center">
          <MaterialCommunityIcons name="shop" size={20} color="white" />
          <Text color="white" fontWeight="bold">
            {isGoogleLoading ? 'Loading...' : 'Google'}
          </Text>
        </XStack>
      </Button>

      <Button
        flex={1}
        backgroundColor="#1877F2"
        color="white"
        borderRadius={8}
        padding={10}
        borderWidth={0}
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        disabled={isFacebookLoading}
        onPress={handleFacebookLogin}>
        <XStack space={8} alignItems="center" justifyContent="center">
          <MaterialCommunityIcons name="facebook" size={20} color="white" />
          <Text color="white" fontWeight="bold">
            {isFacebookLoading ? 'Loading...' : 'Facebook'}
          </Text>
        </XStack>
      </Button>
    </XStack>
  );
};

export default OAuthButtons;