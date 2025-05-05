import { refreshAccessToken } from '../services/apiService';

let intervalId: NodeJS.Timeout | null = null;

export const startTokenRefreshTask = () => {
  stopTokenRefreshTask();
  intervalId = setInterval(async () => {
    await refreshAccessToken();
  }, 60 * 1000); // 1 min interval
};

export const stopTokenRefreshTask = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};