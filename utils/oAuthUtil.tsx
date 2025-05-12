import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { oAuth2sendAuthenticationRequest } from '../services/apiService';

//WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'hardy-gearing-450923-h5',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await promptAsync();
      if (result.type !== 'success') {
        throw new Error('Google authentication was cancelled or failed');
      }

      // Get token
      const { id_token } = result.params;

      // Send token
      await oAuth2sendAuthenticationRequest(id_token, 'google');
      console.log('Google login token sent to server');
      return true;
    } catch (err) {
      console.log('[ERROR] Google login error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading, error, response };
}

// Facebook
export function useFacebookAuth() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: '9055047127939874',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loginWithFacebook = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await promptAsync();
      if (result.type !== 'success') {
        throw new Error('Facebook authentication was cancelled or failed');
      }

      // Get token
      const { token } = result.params;

      // Send token
      await oAuth2sendAuthenticationRequest(token, 'facebook');
      console.log('Facebook login token sent to server');
      return true;
    } catch (err) {
      console.log('[ERROR] Facebook login error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithFacebook, isLoading, error, response };
}
