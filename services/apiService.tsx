import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../components/User'
import { Platform } from 'react-native';

// API URLs
export const API_URL = 'http://172.20.10.14:8080/api/unimap_pc/';

const oAuth_LOGIN_URL = `${API_URL}oauth2/login`;
const CHECK_CONNECTION_URL = `${API_URL}check-connection`;
const GET_NEWS_URL = `${API_URL}news/all`;
const AUTH_URL = `${API_URL}authenticate`;
const REGISTR_URL = `${API_URL}register`;
const FIND_USER_BY_EMAIL_URL = `${API_URL}user/email/`;
const CONFIRM_CODE_TO_EMAIL = `${API_URL}user/email/code`;
const CHANGE_PASSWORD = `${API_URL}user/email/password`;
const SUBJECTS_URL = `${API_URL}resources/subjects`;
const TEACHERS_URL = `${API_URL}resources/teachers`;
const LOG_URL = `${API_URL}log`;
const COMMENTS_URL = `${API_URL}comments/`;
const PREMIUM_URL = `${API_URL}premium/`;
const CHANGE_USERNAME_URL = `${API_URL}change_username`;
const CHANGE_USER_EMAIL_URL = `${API_URL}change_email`;
const CHANGE_USER_AVATAR_URL = `${API_URL}change_avatar?fileName=`;
const REFRESH_TOKENS_URL = `${API_URL}refresh`;

// Comment API endpoints
const ALL_TEACHERS_URL = `${API_URL}comments/teacher/`;
const ALL_SUBJECTS_URL = `${API_URL}comments/subject/`;
const ADD_TEACHERS_COMMENT_URL = `${API_URL}comments/teacher`;
const ADD_SUBJECTS_COMMENT_URL = `${API_URL}comments/subject`;
const DELETE_TEACHERS_COMMENT_URL = `${API_URL}comments/teacher/`;
const DELETE_SUBJECTS_COMMENT_URL = `${API_URL}comments/subject/`;
const DELETE_USER_URL = `${API_URL}user/delete/all/`;
const DELETE_COMMENTS_USER_URL = `${API_URL}user/delete/comments/`;

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

// Extract refresh token from response
const extractRefreshToken = (response: Response) => {
  const setCookieHeader = response.headers.get('set-cookie');
  if (!setCookieHeader) return null;

  const cookies = setCookieHeader.split(';');
  const refreshToken = cookies.find((cookie: string) => cookie.trim().startsWith('refreshToken='));
  return refreshToken ? refreshToken.split('=')[1] : null;
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('REFRESH_TOKEN');

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

// Check connection
export const checkConnection = async () => {
  try {
    const response = await fetch(CHECK_CONNECTION_URL);
    return response.ok;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

export const checkAuthOnStartup = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
    const refreshToken = await AsyncStorage.getItem('REFRESH_TOKEN');

    if (!accessToken || !refreshToken) {
      console.log('No access or refresh token found');
      return false;
    }

    refreshAccessToken();

    console.log('User is authenticated');
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export const sendPushTokenToServer = async (token: string) => {
  try {
    const platform = Platform.OS === 'android' ? 'android' : 'ios';

    const response = await fetch('http://192.168.0.119:8080/api/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: 'unique-device-id',
        fcmToken: token,
        platform,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send FCM token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('FCM token sent successfully:', data);
  } catch (error) {
    console.error('Error sending FCM token to server:', error);
  }
};

// Send authentication request
export const sendAuthenticationRequest = async (email: string, password: string) => {
  if (!email || !password) return false;

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ data: `${email}:${password}` }),
    });

    if (response.ok) {
      const json = await response.json();
      const user = json.user;
      const accessToken = json.accessToken;
      const refreshToken = extractRefreshToken(response);

      if (accessToken && refreshToken) {
        //  console.log('Access ', accessToken);
        //  console.log('Refresh ', refreshToken);
        //  console.log('User :', user);
        await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
        await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));

        // Start token refresh task
        startTokenRefreshTask();

        return true;
      } else {
        console.error('Tokens not found in the response.');
        return false;
      }
    } else {
      console.error(`Authentication failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Authentication request failed:', error);
    return false;
  }
};

// Send authentication request oAuth2
export const oAuth2sendAuthenticationRequest = async (token: string, provider: string) => {
  if (!token || !provider) return false;

  const postData = `code=${token}&provider=${provider}`;

  try {
    const response = await fetch(oAuth_LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: postData,
    });

    if (response.ok) {
      const json = await response.json();
      const user = json.user;
      const accessToken = json.accessToken;
      const refreshToken = extractRefreshToken(response);

      if (accessToken && refreshToken) {
        //  console.log('Access ', accessToken);
        //  console.log('Refresh ', refreshToken);
        //  console.log('User :', user);
        await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
        await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));

        // Start token refresh task
        startTokenRefreshTask();

        return true;
      } else {
        console.error('Tokens not found in the response.');
        return false;
      }
    } else {
      console.error(`Authentication failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Authentication request failed:', error);
    return false;
  }
};


// Send registration request
export const sendRegistrationRequest = async (login: string,username: string,email: string,password: string) => {
  try {
    const response = await fetch(REGISTR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: `${username}:${email}:${login}:${password}` }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error(`Authentication failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Registation request failed:', error);
    return false;
  }
}

// Send password change request
// Confirm email
export const sendEmailConfirmationRequest = async (email: string) => {
  try {
    const response = await fetch(`${FIND_USER_BY_EMAIL_URL}${email}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return true;
    } else {
      console.error(`Authentication failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Email confirmation request failed:', error);
    return false;
  }
}
// Confirm code
export const sendCodeConfirmationRequest = async (email: string,code: string) => {
  try {
    const response = await fetch(CONFIRM_CODE_TO_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: `${email}:${code}` }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error(`Authentication failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Code confirmation failed:', error);
    return false;
  }
}
// Set new password
export const sendNewPasswordRequest = async (email: string,password: string) => {
  try {
    const response = await fetch(CHANGE_PASSWORD, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: `${email}:${password}` }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error(`sendNewPasswordRequest failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('NewPass request failed:', error);
    return false;
  }
}

// Fetch subjects from local storage
export const fetchSubjects = async () => {

  return [
    {
      id: 1,
      name: 'Web Technologies',
      code: 'WTECH_B',
      guarantor: 'Prof. Doc. Yaroslav Marochok, PhD',
      type: 'Obligatory',
      semester: 'Winter Semester'
    },
    {
      id: 2,
      name: 'System Programming in Assembly',
      code: 'SPAASM_B',
      guarantor: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      type: 'Optional',
      semester: 'Summer Semester'
    },
    {
      id: 3,
      name: 'Probability and Statistics',
      code: 'PAS_B',
      guarantor: 'Doc. Doc. Nazar Meredov, Doc.',
      type: 'Optional',
      semester: 'Winter Semester'
    },
    {
      id: 4,
      name: 'Programming in Rust Language',
      code: 'RUST_B',
      guarantor: 'Doc. Doc. Nazar Meredov, Doc.',
      type: 'Optional',
      semester: 'Summer Semester'
    }
  ];

};
// Fetch concrete subject from local storage
export const fetchSubjectDetails = async (subjectId: string | number) => {
  try {
    const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');

    const response = await fetch(`${SUBJECTS_URL}/${subjectId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subject details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};


// Fetch teachers from local storage
export const fetchTeachers = async () => {

  // For demo purposes, return test data if API fails
  return [
    {
      id: 1,
      name: 'Prof. Doc. Yaroslav Marochok, PhD',
      aisId: '127421',
      rating: '3.16',
      role: 'Professor',
      department: 'Computer Science'
    },
    {
      id: 2,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Associate Professor',
      department: 'Software Engineering'
    },
    {
      id: 3,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Associate Professor',
      department: 'Mathematics'
    },
    {
      id: 4,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Assistant Professor',
      department: 'Information Systems'
    },
    {
      id: 5,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Professor',
      department: 'Artificial Intelligence'
    }
  ];
};
// Fetch concrete teacher from local storage
export const fetchTeacherDetails = async (teacherId: string | number) => {
  try {
    const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');

    const response = await fetch(`${TEACHERS_URL}/${teacherId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teacher details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    throw error;
  }
};

// Buy premium
export const buyPremium = async (userId: string) => {
  if (!userId) return false;

  try {
    const response = await fetch(`${PREMIUM_URL}${userId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`, },
    });

    if (response.ok) {
      const json = await response.json();
      const user = json.user;

      console.log(user);
      await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));
      return true;
    } else {
      console.error(`Buying Premium failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Premium buying request failed:', error);
    return false;
  }
  return true;
}

// Delete all user comments
export const deleteComments = async (userId: number | undefined) => {
  if (!userId) return false;

  try {
    const response = await fetch(`${DELETE_COMMENTS_USER_URL}${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
    });

    if (response.ok) {
      console.log('Deleting comments successful');

      return true;
    } else {
      console.error(`Deleting comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Deleting comments request failed:', error);
    return false;
  }
  return true;
};

// Delete user
export const deleteUser = async (userId: number | undefined) => {
  if (!userId) return false;

  try {
    const response = await fetch(`${DELETE_USER_URL}${userId}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`, },
    });

    if (response.ok) {
      console.log('Deleting user successful');

      return true;
    } else {
      console.error(`Delete user failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Delete user request failed:', error);
    return false;
  }
  return true;
}

// Change user email
export const changeUserEmail = async (login: string | undefined, newEmail: string) => {
  if (!login || !newEmail) return false;

  try {
    const response = await fetch(CHANGE_USER_EMAIL_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, email: newEmail }),
    });

    if (response.ok) {
      await User.setEmail(newEmail);
      return true;
    } else {
      console.error(`Email changing failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Change email request failed:', error);
    return false;
  }
  return true;
};

// Change user name
export const changeUserName = async (email: string | undefined, newName: string) => {
  console.log('Change user name: ', newName);
  if (!email || !newName) return false;

  try {
    const response = await fetch(CHANGE_USERNAME_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: newName }),
    });

    if (response.ok) {
      await User.setName(newName);
      return true;
    } else {
      console.error(`Username changing failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Change username request failed:', error);
    return false;
  }
  return true;
};

// Change user avatar
export const updateUserAvatar = async (userId: number | undefined, base64ImageData: string, fileName: string | undefined) => {
  if (!userId || !base64ImageData || !fileName) return false;

  try {
    const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
    if (!accessToken) {
      console.error('No access token available for avatar upload');
      return false;
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let contentType = '';
    switch (fileExtension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpeg':
      case 'jpg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      default:
        contentType = 'image/jpeg';
    }

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android'
        ? `data:${contentType};base64,${base64ImageData}`
        : base64ImageData.includes('data:')
          ? base64ImageData
          : `data:${contentType};base64,${base64ImageData}`,
      name: fileName,
      type: contentType,
    } as any);

    const response = await fetch(CHANGE_USER_AVATAR_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      console.log('Avatar updated successfully');

      await User.setAvatarBase64(base64ImageData);
      await User.setAvatarName(fileName);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Avatar update failed: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('Change avatar request failed:', error);
    return false;
  }
};