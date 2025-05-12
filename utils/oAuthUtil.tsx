import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { oAuth2sendAuthenticationRequest } from "../services/apiService";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: '162210744287-qn8sq1a09rbjcagtnqmk38t98f8132u3.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
    }
  );

  const handleGoogleSignIn = async () => {
    try {
      const authResult = await promptAsync();

      if (authResult.type === 'success') {
        const { authentication } = authResult;

        if (authentication?.accessToken) {
          const isSuccess = await oAuth2sendAuthenticationRequest(
            authentication.accessToken,
            'google'
          );

          if (isSuccess) {
            await AsyncStorage.setItem('userToken', authentication.accessToken);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Google Auth Error:', error);
      return false;
    }
  };

  return {
    request,
    response,
    handleGoogleSignIn
  };
};




export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest(
    {
      clientId: '577543324819426',
      scopes: ['public_profile', 'email'],
    }
  );

  const handleFacebookSignIn = async () => {
    try {
      const authResult = await promptAsync();

      if (authResult.type === 'success') {
        const { authentication } = authResult;

        if (authentication?.accessToken) {
          const isSuccess = await oAuth2sendAuthenticationRequest(
            authentication.accessToken,
            'facebook'
          );

          if (isSuccess) {
            await AsyncStorage.setItem('userToken', authentication.accessToken);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Facebook Auth Error:', error);
      return false;
    }
  };

  return {
    request,
    response,
    handleFacebookSignIn
  };
};