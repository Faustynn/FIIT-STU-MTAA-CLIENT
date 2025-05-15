import AsyncStorage from '@react-native-async-storage/async-storage';

let intervalId: NodeJS.Timeout | null = null;

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('REFRESH_TOKEN');
    const API_URL = 'http://192.168.0.119:8080/api/unimap_pc/';
    const REFRESH_TOKENS_URL = `${API_URL}refresh`;

    if (!refreshToken || refreshToken.trim() === '') {
      console.log('No refresh token available');
      return false;
    }

    const requestBody = { refreshToken };

    const response = await fetch(REFRESH_TOKENS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.accessToken;

      if (newAccessToken) {
        console.log('New access token:', newAccessToken);
        await AsyncStorage.setItem('ACCESS_TOKEN', newAccessToken);
        console.log('Access token refreshed successfully');
        return true;
      }
    }

    console.error('Token refresh failed with status:', response.status);
    return false;
  } catch (error) {
    console.error('Refresh token error:', error);
    return false;
  }
};

export const startTokenRefreshTask = () => {
  stopTokenRefreshTask();
  intervalId = setInterval(async () => {
    await refreshAccessToken();
  }, 50 * 1000); // 50 sec interval
};

export const stopTokenRefreshTask = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};