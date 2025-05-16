import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { User } from '../components/User';

// API URLs
export const API_URL = 'http://147.175.161.201:8080/api/unimap_pc/';

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
};

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
        await AsyncStorage.clear();

        await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
        await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));

        // Take subject and teacher data
        fetchSubjects();
        fetchTeachers();

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
export const sendRegistrationRequest = async (
  login: string,
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await fetch(REGISTR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: `${username}:${password}:${email}:${login}` }),
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
};

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
};
// Confirm code
export const sendCodeConfirmationRequest = async (email: string, code: string) => {
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
};
// Set new password
export const sendNewPasswordRequest = async (email: string, password: string) => {
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
};

export interface Subject {
  code: string;
  name: string;
  type: string;
  credits: number;
  studyType: string;
  semester: string;
  languages: string[];
  completionType: string;
  studentCount: number;
  evaluation: string | null;
  assesmentMethods: string;
  learningOutcomes: string;
  courseContents: string;
  plannedActivities: string;
  evaluationMethods: string;
  ascore: string;
  bscore: string;
  cscore: string;
  dscore: string;
  escore: string;
  FXscore: string;
}
export interface SubjectRole {
  subjectCode: string;
  roles: string[];
}
export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  office: string | null;
  subjects: SubjectRole[];
}

// Parse subject datas
export const parseSubjects = (data: any): Subject[] => {
  const subjects: Subject[] = [];

  if (!data) {
    console.error('No subject data received!!');
    return subjects;
  }

  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return parseSubjects(parsedData);
    } catch (error) {
      console.error('Error parsing string as JSON:', error);
      return subjects;
    }
  }

  if (typeof data === 'object' && !Array.isArray(data) && data.subjects) {
    if (Array.isArray(data.subjects)) {
      data.subjects.forEach((item: any) => {
        try {
          const subject = parseSubjectObject(item);
          if (subject) {
            subjects.push(subject);
          }
        } catch (error) {
          console.error(`Error parsing subject data from subjects array:`, error);
        }
      });
    }
    return subjects;
  }

  if (Array.isArray(data)) {
    data.forEach((item: any) => {
      try {
        if (item && typeof item === 'object') {
          const subject = parseSubjectObject(item);
          if (subject) {
            subjects.push(subject);
          }
        }
      } catch (error) {
        console.error(`Error parsing subject data from array:`, error);
      }
    });
    return subjects;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      try {
        if (value && typeof value === 'object') {
          const subject = parseSubjectObject(value, key);
          if (subject) {
            subjects.push(subject);
          }
        }
      } catch (error) {
        console.error(`Error parsing subject data for ${key}:`, error);
      }
    });
  }

  return subjects;
};
function parseSubjectObject(data: any, codeFromKey?: string): Subject | null {
  if (!data) return null;

  try {
    let languages: string[] = [];
    if (data.languages) {
      if (Array.isArray(data.languages)) {
        // ["{\"slovenský jazyk\"", "\"anglický jazyk\"}"]
        if (data.languages.length > 0) {
          const joinedLanguages = data.languages.join(',');

          // cleaner
          const cleanedLanguages = joinedLanguages
            .replace(/["{}\\]/g, '')
            .split(',')
            .map((lang: string) => lang.trim())
            .filter((lang: string) => lang);

          languages = cleanedLanguages;
        }
      } else if (typeof data.languages === 'string') {
        try {
          languages = JSON.parse(data.languages); // try to pa
        } catch {
          languages = data.languages.split(',').map((l: string) => l.trim());
        }
      }
    }

    const safeToString = (value: any): string => {
      if (value === null || value === undefined) return '0';
      return value.toString();
    };

    const fxScore =
      data.FXscore !== undefined ? data.FXscore : data.fxscore !== undefined ? data.fxscore : '0';

    const subject: Subject = {
      code: data.code || codeFromKey || '',
      name: data.name ? data.name.trim() : '',
      type: data.type || '',
      credits: Number(data.credits) || 0,
      studyType: data.studyType || '',
      semester: data.semester || '',
      languages,
      completionType: data.completionType || '',
      studentCount: Number(data.studentCount) || 0,
      evaluation: data.evaluation === undefined ? null : data.evaluation,
      assesmentMethods: data.assesmentMethods || '',
      learningOutcomes: data.learningOutcomes || '',
      courseContents: data.courseContents || '',
      plannedActivities: data.plannedActivities || '',
      evaluationMethods: data.evaluationMethods || '',
      ascore: safeToString(data.ascore),
      bscore: safeToString(data.bscore),
      cscore: safeToString(data.cscore),
      dscore: safeToString(data.dscore),
      escore: safeToString(data.escore),
      FXscore: safeToString(fxScore),
    };

    return subject;
  } catch (error) {
    console.error('Error parsing subject object:', error);
    return null;
  }
}

// parse teacher datas
export const parseTeachers = (data: any): Teacher[] => {
  const teachersMap: Map<string, Teacher> = new Map();

  interface SubjectRole {
    subjectCode: string;
    roles: string[];
  }

  try {
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing teacher data string:', e);
        return [];
      }
    } else {
      parsedData = data;
    }

    const teachersArray = Array.isArray(parsedData)
      ? parsedData
      : parsedData?.teachers && Array.isArray(parsedData.teachers)
        ? parsedData.teachers
        : [];

    teachersArray.forEach((item: any) => {
      if (item && typeof item === 'object') {
        const subjectsArray = Array.isArray(item.subjects)
          ? item.subjects.map((subject: any) => {
              let roles: string[] = [];
              if (Array.isArray(subject.roles)) {
                roles = subject.roles;
              } else if (typeof subject.roles === 'string') {
                const rolesStr = subject.roles.replace(/^\{|\}$/g, '').replace(/\"/g, '');
                roles = rolesStr.split(',').map((role: string) => role.trim());
              }

              return {
                subjectCode: subject.subjectName || '',
                roles,
              };
            })
          : [];

        const teacherId = item.id.toString();

        // Check if we have this teacher
        if (teachersMap.has(teacherId)) {
          // Merge subjects with existing teacher record
          const existingTeacher = teachersMap.get(teacherId)!;
          const existingSubjectMap = new Map<string, SubjectRole>();

          existingTeacher.subjects.forEach((subject: SubjectRole) => {
            existingSubjectMap.set(subject.subjectCode, subject);
          });

          // Merge new subjects
          subjectsArray.forEach((newSubject: SubjectRole) => {
            if (existingSubjectMap.has(newSubject.subjectCode)) {
              // Merge roles
              const existingSubject = existingSubjectMap.get(newSubject.subjectCode);
              const uniqueRoles = new Set([...(existingSubject?.roles || []), ...newSubject.roles]);
              if (existingSubject) {
                existingSubject.roles = Array.from(uniqueRoles);
              }
            } else {
              // Add new subject
              existingTeacher.subjects.push(newSubject);
            }
          });
        } else {
          // Create new teacher record
          teachersMap.set(teacherId, {
            id: Number(item.id) || 0,
            name: item.name || '',
            email: item.email || '',
            phone: item.phone || '',
            office: item.office || null,
            subjects: subjectsArray,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error parsing teachers data:', error);
  }
  return Array.from(teachersMap.values());
};

export const fetchSubjects = async (): Promise<Subject[]> => {
  const cachedData = await AsyncStorage.getItem('CACHED_SUBJECTS');
  if (cachedData) {
    console.log(' Using cached subjects data from AsyncStorage');
    return JSON.parse(cachedData);
  }
  console.log(' No cached data found, fetching from server...');
  const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
  if (!accessToken) throw new Error('No access token');

  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(SUBJECTS_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`❌ Failed (status ${response.status}): ${text}`);
      }

      const rawData = await response.json();
      //    console.log('Received subjects data:', JSON.stringify(rawData, null, 2));
      const subjects = parseSubjects(rawData);

      await AsyncStorage.setItem('CACHED_SUBJECTS', JSON.stringify(subjects));
      console.log('💾 Subjects data cached to AsyncStorage');

      return subjects;
    } catch (err) {
      attempt++;
      console.error(
        ` fetchSubjects failed (attempt ${attempt}/${maxAttempts}), retrying in 15s...`
      );
      await new Promise((res) => setTimeout(res, 15000));
    }
  }

  throw new Error(` fetchSubjects failed after ${maxAttempts} attempts`);
};
export const fetchSubjectDetails = async (subjectId: string | number): Promise<Subject> => {
  const cachedData = await AsyncStorage.getItem('CACHED_SUBJECTS');
  if (cachedData) {
    const subjects = JSON.parse(cachedData) as Subject[];
    const found = subjects.find((s) => s.code.toString() === subjectId.toString());

    if (found) {
      console.log(` Found subject ${subjectId} in cached data`);
      return found;
    }
  }

  console.log(` Subject ${subjectId} not found in cache, fetching from server...`);
  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const subjects = await fetchSubjects();
      const found = subjects.find((s) => s.code.toString() === subjectId.toString());
      if (!found) throw new Error('Subject not found by code: ' + subjectId);
      return found;
    } catch (err) {
      attempt++;
      console.error(
        ` fetchSubjectDetails failed (attempt ${attempt}/${maxAttempts}), retrying in 15s...`,
        err
      );
      await new Promise((res) => setTimeout(res, 15000));

      if (attempt >= maxAttempts) {
        throw new Error(` fetchSubjectDetails failed after ${maxAttempts} attempts`);
      }
    }
  }
  throw new Error('Subject not found');
};

export const fetchTeachers = async (): Promise<Teacher[]> => {
  const cachedTeachers = await AsyncStorage.getItem('CACHED_TEACHERS');
  if (cachedTeachers) {
    console.log(' Using cached teachers data from AsyncStorage');
    try {
      return JSON.parse(cachedTeachers);
    } catch (err) {
      console.error('Error parsing cached teachers data, will fetch from server', err);
    }
  }

  console.log(' No cached teachers found, fetching from server...');
  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (!token) throw new Error('No access token available');

      const response = await fetch(TEACHERS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch teachers: ${response.status}`);

      const json = await response.json();
      console.log('Received teachers data format:', typeof json);
      const teachers = parseTeachers(json);

      await AsyncStorage.setItem('CACHED_TEACHERS', JSON.stringify(teachers));
      console.log(' Teachers data cached to AsyncStorage');

      return teachers;
    } catch (err) {
      attempt++;
      console.error(
        ` fetchTeachers failed (attempt ${attempt}/${maxAttempts}), retrying in 15s...`,
        err
      );
      await new Promise((res) => setTimeout(res, 15000));

      if (attempt >= maxAttempts) {
        throw new Error(` fetchTeachers failed after ${maxAttempts} attempts`);
      }
    }
  }
  throw new Error('Failed to fetch teachers');
};
export const fetchTeacherDetails = async (teacherId: string | number): Promise<Teacher> => {
  // First check cache
  const cachedTeachers = await AsyncStorage.getItem('CACHED_TEACHERS');
  if (cachedTeachers) {
    const teachers = JSON.parse(cachedTeachers);
    const found = teachers.find((t: Teacher) => t.id.toString() === teacherId.toString());

    if (found) {
      console.log(`📦 Found teacher ${teacherId} in cached data`);
      return found;
    }
  }

  // If not found in cache, fetch from server
  console.log(`🔄 Teacher ${teacherId} not found in cache, fetching from server...`);
  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const allTeachers = await fetchTeachers();
      const found = allTeachers.find((t: Teacher) => t.id.toString() === teacherId.toString());

      if (!found) throw new Error('Teacher not found by ID: ' + teacherId);

      return found;
    } catch (err) {
      attempt++;
      console.error(
        `❌ fetchTeacherDetails failed (attempt ${attempt}/${maxAttempts}), retrying in 15s...`,
        err
      );
      await new Promise((res) => setTimeout(res, 15000));

      if (attempt >= maxAttempts) {
        throw new Error(`❌ fetchTeacherDetails failed after ${maxAttempts} attempts`);
      }
    }
  }

  // This should never be reached due to throw in the loop, but TypeScript expects a return
  throw new Error('Teacher not found');
};

export const getTeachersForSubject = async (subjectCode: string): Promise<Teacher[]> => {
  const allTeachers = await fetchTeachers();

  return allTeachers.filter((teacher) =>
    teacher.subjects.some((subject) => subject.subjectCode === subjectCode)
  );
};
export const getSubjectsForTeacher = async (
  teacherId: number | string
): Promise<{ subject: Subject; roles: string[] }[]> => {
  const teacher = await fetchTeacherDetails(teacherId);
  const allSubjects = await fetchSubjects();
  const result: { subject: Subject; roles: string[] }[] = [];

  for (const teacherSubject of teacher.subjects) {
    const subject = allSubjects.find((s) => s.code === teacherSubject.subjectCode);
    if (subject) {
      result.push({
        subject,
        roles: teacherSubject.roles,
      });
    }
  }

  return result;
};

export const buyPremium = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  while (true) {
    try {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (!token) throw new Error('No access token available');

      const response = await fetch(`${PREMIUM_URL}${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`❌ Failed (status ${response.status}): ${text}`);
      }

      const json = await response.json();
      const user = json.user;
      await AsyncStorage.setItem('USER_DATA', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error(`❌ buyPremium failed, retrying in 15s...`, error);
      await new Promise((res) => setTimeout(res, 15000));
    }
  }
};

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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
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
};

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
export const updateUserAvatar = async (
  userId: number | undefined,
  base64ImageData: string,
  fileName: string | undefined
) => {
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
      uri:
        Platform.OS === 'android'
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
        Authorization: `Bearer ${accessToken}`,
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

// Fetch all comments for a specific teacher
export const get_all_teachers_comments = async (teacherId: number | string): Promise<any> => {
  if (!teacherId) return false;

  try {
    const response = await fetch(`${ALL_TEACHERS_URL}${teacherId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      // console.log('ALL TEACHERS:', json);
      return json;
    } else {
      console.error(`Fetch all teacher comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Fetch all teacher comments request failed:', error);
    return false;
  }
  return true;
};
// Add new comment for teacher
export const add_new_commet_teachers = async (jsonBody: {
  code: string | number;
  user_id: number;
  rating: number | string;
  text: string;
  levelAccess: number;
}): Promise<boolean> => {
  if (!jsonBody) return false;

  try {
    const response = await fetch(`${ADD_TEACHERS_COMMENT_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
      body: JSON.stringify(jsonBody),
    });

    if (response.status === 201) {
      return true;
    } else {
      console.error(`Fetch all teacher comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Fetch all teacher comments request failed:', error);
    return false;
  }
  return true;
};
//Delete comment for teacher
export const delete_teacher_comment = async (comment_id: number): Promise<any> => {
  if (!comment_id) return false;

  try {
    const response = await fetch(`${DELETE_TEACHERS_COMMENT_URL}${comment_id}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return true;
    } else {
      console.error(`Delete teacher comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Delete teacher comments request failed:', error);
    return false;
  }
};

// Fetch all comments for a specific subject
export const get_all_subjects_comments = async (subjectId: number | string): Promise<any> => {
  if (!subjectId) return false;

  try {
    const response = await fetch(`${ALL_SUBJECTS_URL}${subjectId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      // console.log('ALL SUBJECTS:', json);
      return json;
    } else {
      console.error(`Fetch all subjects comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Fetch all subjects comments request failed:', error);
    return false;
  }
  return true;
};
// Add new comment for subject
export const add_new_commet_subjects = async (jsonBody: {
  code: string | number;
  user_id: number;
  rating: number | string;
  text: string;
  levelAccess: number;
}): Promise<boolean> => {
  if (!jsonBody) return false;

  try {
    const response = await fetch(`${ADD_SUBJECTS_COMMENT_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
      body: JSON.stringify(jsonBody),
    });

    if (response.status === 201) {
      return true;
    } else {
      console.error(`Fetch all teacher comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Fetch all teacher comments request failed:', error);
    return false;
  }

  return true;
};
//Delete comment for subject
export const delete_subject_comment = async (teacherId: number): Promise<any> => {
  if (!teacherId) return false;

  try {
    const response = await fetch(`${DELETE_SUBJECTS_COMMENT_URL}${teacherId}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return true;
    } else {
      console.error(`Delete subject comments failed with status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Delete subject comments request failed:', error);
    return false;
  }
};
