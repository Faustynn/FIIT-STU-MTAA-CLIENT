import AsyncStorage from '@react-native-async-storage/async-storage';
import {startTokenRefreshTask} from '../components/TokenRefresher';
// API URLs
const API_URL = 'http://192.168.0.119:8080/api/unimap_pc/';

const CHECK_CONNECTION_URL = `${API_URL}check-connection`;
const GET_NEWS_URL = `${API_URL}news/all`;
const AUTH_URL = `${API_URL}authenticate`;
const REGISTR_URL = `${API_URL}register`;
const FIND_USER_BY_EMAIL_URL = `${API_URL}user/email/`;
const CONFIRM_CODE_TO_EMAIL = `${API_URL}user/email/code`;
const CHANGE_PASSWORD = `${API_URL}user/email/change_pass`;
const REFRESH_TOKENS_URL = `${API_URL}refresh`;
const SUBJECTS_URL = `${API_URL}resources/subjects`;
const TEACHERS_URL = `${API_URL}resources/teachers`;
const LOG_URL = `${API_URL}log`;
const COMMENTS_URL = `${API_URL}comments/`;

// Comment API endpoints
const ALL_TEACHERS_URL = `${API_URL}comments/teacher/`;
const ALL_SUBJECTS_URL = `${API_URL}comments/subject/`;
const ADD_TEACHERS_COMMENT_URL = `${API_URL}comments/teacher`;
const ADD_SUBJECTS_COMMENT_URL = `${API_URL}comments/subject`;
const DELETE_TEACHERS_COMMENT_URL = `${API_URL}comments/teacher/`;
const DELETE_SUBJECTS_COMMENT_URL = `${API_URL}comments/subject/`;
const DELETE_USER_URL = `${API_URL}user/delete/all/`;
const DELETE_COMMENTS_USER_URL = `${API_URL}user/delete/comments/`;

// Extract refresh token from response
const extractRefreshToken = (response: Response) => {
  const setCookieHeader = response.headers.get('set-cookie');
  if (!setCookieHeader) return null;

  const cookies = setCookieHeader.split(';');
  const refreshToken = cookies.find((cookie: string) => cookie.trim().startsWith('refreshToken='));
  return refreshToken ? refreshToken.split('=')[1] : null;
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