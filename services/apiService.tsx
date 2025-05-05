import { Subject } from '../pages/SubjectsPage';
import { Teacher } from '../pages/TeachersPage';
import { News } from '../pages/HomePage';


// test api version

const API_BASE_URL = 'http://localhost:8080/api/unimap_pc/';

export const fetchSubjects = async (): Promise<Subject[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // test datas
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
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};


export const fetchSubjectDetails = async (subjectId: string | number) => {
  const response = await fetch(`/api/subjects/${subjectId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch subject details');
  }
  return response.json();
};




export const fetchTeachers = async (): Promise<Teacher[]> => {
  try {

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // test datas
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
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

export const fetchTeacherDetails = async (teacherId: string | number) => {
  const response = await fetch(`/api/subjects/${teacherId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch subject details');
  }
  return response.json();
};