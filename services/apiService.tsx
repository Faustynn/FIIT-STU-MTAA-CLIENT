import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { startTokenRefreshTask } from '../components/TokenRefresher';
import { User } from '../components/User';

// API URLs
const API_URL = 'http://172.20.10.4:8080/api/unimap_pc/';

const CHECK_CONNECTION_URL = `${API_URL}check-connection`;
const GET_NEWS_URL = `${API_URL}news/all`;
const AUTH_URL = `${API_URL}authenticate`;
const REGISTR_URL = `${API_URL}register`;
const FIND_USER_BY_EMAIL_URL = `${API_URL}user/email/`;
const CONFIRM_CODE_TO_EMAIL = `${API_URL}user/email/code`;
const CHANGE_PASSWORD = `${API_URL}user/email/password`;
const REFRESH_TOKENS_URL = `${API_URL}refresh`;
const SUBJECTS_URL = `${API_URL}resources/subjects`;
const TEACHERS_URL = `${API_URL}resources/teachers`;
const LOG_URL = `${API_URL}log`;
const COMMENTS_URL = `${API_URL}comments/`;
const PREMIUM_URL = `${API_URL}premium/`;
const CHANGE_USERNAME_URL = `${API_URL}change_username`;
const CHANGE_USER_EMAIL_URL = `${API_URL}change_email`;
const CHANGE_USER_AVATAR_URL = `${API_URL}change_avatar?fileName=`;

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

// // Fetch subjects from local storage
// export const fetchSubjects = async () => {
//   return [
//     {
//       id: 1,
//       name: 'Web Technologies',
//       code: 'WTECH_B',
//       guarantor: 'Prof. Doc. Yaroslav Marochok, PhD',
//       type: 'Obligatory',
//       semester: 'Winter Semester',
//     },
//     {
//       id: 2,
//       name: 'System Programming in Assembly',
//       code: 'SPAASM_B',
//       guarantor: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
//       type: 'Optional',
//       semester: 'Summer Semester',
//     },
//     {
//       id: 3,
//       name: 'Probability and Statistics',
//       code: 'PAS_B',
//       guarantor: 'Doc. Doc. Nazar Meredov, Doc.',
//       type: 'Optional',
//       semester: 'Winter Semester',
//     },
//     {
//       id: 4,
//       name: 'Programming in Rust Language',
//       code: 'RUST_B',
//       guarantor: 'Doc. Doc. Nazar Meredov, Doc.',
//       type: 'Optional',
//       semester: 'Summer Semester',
//     },
//   ];
// };

export const fetchSubjects = async (): Promise<Subject[]> => {
  const token = await AsyncStorage.getItem('accessToken');

  const response = await fetch(SUBJECTS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Ошибка при получении предметов');

  const json = await response.json();

  return parseSubjects(json.subjects || []);
};

export const parseSubjects = (raw: any[]): Subject[] => {
  return raw.map((s) => ({
    ...s,
    languages: s.languages?.split(',') ?? [],
  }));
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
      department: 'Computer Science',
    },
    {
      id: 2,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Associate Professor',
      department: 'Software Engineering',
    },
    {
      id: 3,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Associate Professor',
      department: 'Mathematics',
    },
    {
      id: 4,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Assistant Professor',
      department: 'Information Systems',
    },
    {
      id: 5,
      name: 'Ing. Doc. Olexandr Dokaniev, Mgr.',
      aisId: '127421',
      rating: '3.16',
      role: 'Professor',
      department: 'Artificial Intelligence',
    },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
      },
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
  assesmentMethods: string;
  learningOutcomes: string;
  courseContents: string;
  plannedActivities: string;
  evaluationMethods: string;
  a_score: string;
  b_score: string;
  c_score: string;
  d_score: string;
  e_score: string;
  fx_score: string;
}

export const mockSubjectsResponse = {
  subjects: [
    {
      code: 'WTECH_B',
      name: 'Web Technologies',
      type: 'Obligatory',
      credits: 6,
      studyType: 'Bachelor',
      semester: 'ZS',
      languages: 'sk,en',
      completionType: 'Exam',
      studentCount: 120,
      assesmentMethods: 'Written exam',
      learningOutcomes: 'Students understand frontend/backend communication.',
      courseContents: 'HTTP, REST, JavaScript, Laravel',
      plannedActivities: 'Lectures, labs, project',
      evaluationMethods: 'Exam and project',
      a_score: '25%',
      b_score: '30%',
      c_score: '20%',
      d_score: '10%',
      e_score: '10%',
      fx_score: '5%',
    },
    {
      code: 'SPAASM_B',
      name: 'System Programming in Assembly',
      type: 'Optional',
      credits: 5,
      studyType: 'Engineer',
      semester: 'LS',
      languages: 'sk',
      completionType: 'Graded Credit',
      studentCount: 60,
      assesmentMethods: 'Project',
      learningOutcomes: 'Students understand low-level programming.',
      courseContents: 'x86, memory, system calls',
      plannedActivities: 'Labs',
      evaluationMethods: 'Final project',
      a_score: '30%',
      b_score: '25%',
      c_score: '20%',
      d_score: '10%',
      e_score: '10%',
      fx_score: '5%',
    },
  ],
};

export const fetchSubjects1 = async (): Promise<Subject[]> => {
  const raw = mockSubjectsResponse.subjects;
  return parseSubjects(raw);
};

export const mockSubjectDetails = {
  code: 'SPAASM_B',
  name: 'System Programming in Assembly',
  type: 'Optional',
  semester: 'ZS',
  guarantor: 'Olexandr Dokaniev',
  credits: 5,
  description: 'This subject introduces students to low-level programming in Assembly.',
  language: 'sk',
  prerequisites: ['Introduction to Programming', 'Computer Architecture'],
  objectives: 'Understand how Assembly works with memory and system calls.',
  syllabus: ['Introduction', 'Registers', 'Memory Management', 'System Calls'],
  instructors: [
    { id: 1, name: 'Olexandr Dokaniev', role: 'Lecturer' },
    { id: 2, name: 'John Novak', role: 'Lab Assistant' },
  ],
};

export const fetchSubjectDetails1 = async (subjectId: string | number) => {
  // в реальности можешь использовать subjectId, а пока заглушка
  return Promise.resolve(mockSubjectDetails);
};

export const mockTeachersResponse = {
  teachers: [
    {
      id: '1',
      name: 'Doc. Ing. John Smith, PhD.',
      email: 'john.smith@fiit.stuba.sk',
      phone: '+421 123 456 789',
      office: 'BC-302',
      aisId: '123456',
      subject_code: 'SPAASM_B',
      roles: 'Lecturer,Supervisor',
      rating: 4.5,
      department: 'Computer Science',
    },
    {
      id: '2',
      name: 'Mgr. Anna Kovácsová',
      email: 'anna.kovacsova@fiit.stuba.sk',
      phone: '+421 987 654 321',
      office: 'BC-112',
      aisId: '654321',
      subject_code: 'WTECH_B',
      roles: 'Lecturer',
      rating: 4.0,
      department: 'Software Engineering',
    },
  ],
};

export const fetchTeachers1 = async () => {
  // имитация задержки
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockTeachersResponse.teachers;
};

export interface ParsedTeacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  office: string;
  aisId: string;
  subjectCode: string;
  roles: string[];
  rating: number;
  department: string;
  consultationHours?: string;
  bio?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  office: string;
  aisId: string;
  subject_code: string;
  roles: string;
  rating: number;
  department: string;
  consultationHours?: string;
  bio?: string;
}

export const parseTeachers = (raw: Teacher[]): ParsedTeacher[] => {
  return raw.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    office: t.office,
    aisId: t.aisId,
    subjectCode: t.subject_code,
    roles: t.roles.split(',').map((r) => r.trim()),
    rating: t.rating,
    department: t.department || 'Unknown',
    consultationHours: t.consultationHours || 'Not specified',
    bio: t.bio || 'No bio available',
  }));
};

export const fetchTeacherDetails1 = async (teacherId: string | number) => {
  return Promise.resolve({
    id: teacherId.toString(),
    name: 'Doc. Ing. John Smith, PhD.',
    email: 'john.smith@fiit.stuba.sk',
    phone: '+421 123 456 789',
    office: 'BC-302',
    aisId: '123456',
    subjectCode: 'SPAASM_B',
    roles: ['Lecturer', 'Supervisor'],
    rating: 4.5,
    department: 'Computer Science',
    consultationHours: 'Monday 10:00-12:00',
    bio: 'John Smith has over 20 years of teaching experience in system programming and algorithms.',
    subjects: [
      { id: 1, name: 'System Programming in Assembly', code: 'SPAASM_B' },
      { id: 2, name: 'Operating Systems', code: 'OS_B' },
    ],
  });
};
