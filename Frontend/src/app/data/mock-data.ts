export interface Course {
  code: string;
  name: string;
  arabic: string;
  instructor: string;
  room: string;
  credits: number;
  students: number;
  progress: number;
}

export interface Student {
  id: string;
  name: string;
  faculty: string;
  level: string;
  gpa: string;
  status: string;
}

export interface Faculty {
  name: string;
  arabic: string;
  dean: string;
  departments: number;
  students: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  contract: string;
  since: string;
}

export const courses: Course[] = [
  { code: 'CS 341', name: 'Artificial Intelligence', arabic: 'الذكاء الاصطناعي', instructor: 'Dr. Salma Hassan', room: 'B-204', credits: 3, students: 42, progress: 68 },
  { code: 'CS 315', name: 'Database Systems', arabic: 'نظم قواعد البيانات', instructor: 'Dr. Omar Adel', room: 'Lab 3', credits: 3, students: 38, progress: 74 },
  { code: 'EDU 210', name: 'Educational Psychology', arabic: 'علم النفس التربوي', instructor: 'Prof. Mona Fathy', room: 'A-112', credits: 3, students: 51, progress: 61 },
  { code: 'CS 322', name: 'Computer Networks', arabic: 'شبكات الحاسب', instructor: 'Dr. Karim Nabil', room: 'B-107', credits: 3, students: 35, progress: 79 },
  { code: 'TOUR 102', name: 'Hospitality Principles', arabic: 'مبادئ الضيافة', instructor: 'Dr. Reem Samir', room: 'C-301', credits: 2, students: 46, progress: 56 },
];

export const students: Student[] = [
  { id: '2024010001', name: 'Nour Ahmed Mahmoud', faculty: 'Computers & Artificial Intelligence', level: 'Third', gpa: '3.82', status: 'Active' },
  { id: '2024010024', name: 'Youssef Mohamed Ali', faculty: 'Education', level: 'Second', gpa: '3.56', status: 'Active' },
  { id: '2023010187', name: 'Mariam Khaled Hassan', faculty: 'Al-Alsun (Languages)', level: 'Fourth', gpa: '3.91', status: 'Active' },
  { id: '2024010119', name: 'Omar Tarek Ibrahim', faculty: 'Computers & Artificial Intelligence', level: 'Third', gpa: '3.27', status: 'Review' },
  { id: '2022010032', name: 'Farida Mostafa Salem', faculty: 'Tourism & Hotels', level: 'Fourth', gpa: '3.68', status: 'Active' },
];

/** Faculties listed on the official website hurghada.edu.eg */
export const faculties: Faculty[] = [
  { name: 'Education', arabic: 'كلية التربية', dean: 'Prof. Dr. Mahfouz Abdel Sattar', departments: 8, students: '2,140' },
  { name: 'Tourism & Hotels', arabic: 'كلية السياحة والفنادق', dean: 'Prof. Dr. Mohamed Abu Taleb', departments: 5, students: '986' },
  { name: 'Al-Alsun (Languages)', arabic: 'كلية الألسن', dean: 'Dean of Al-Alsun', departments: 4, students: '720' },
  { name: 'Computers & Artificial Intelligence', arabic: 'كلية الحاسبات والذكاء الاصطناعي', dean: 'Dean of Computers & AI', departments: 4, students: '1,248' },
];

export const staff: StaffMember[] = [
  { id: 'HU-1028', name: 'Dr. Salma Hassan', role: 'Associate Professor', department: 'Computer Science', contract: 'Full-time', since: '2018' },
  { id: 'HU-1142', name: 'Dr. Omar Adel', role: 'Lecturer', department: 'Information Systems', contract: 'Full-time', since: '2020' },
  { id: 'HU-0874', name: 'Prof. Mona Fathy', role: 'Professor', department: 'Educational Psychology', contract: 'Full-time', since: '2012' },
  { id: 'HU-1309', name: 'Ms. Reem Samir', role: 'Lab Specialist', department: 'Tourism & Hotels', contract: 'Part-time', since: '2022' },
  { id: 'HU-0955', name: 'Mr. Ahmed Salah', role: 'Administrator', department: 'Student Affairs', contract: 'Full-time', since: '2016' },
];

export const weekSchedule = [
  { day: 'Sunday', classes: [{ time: '09:00', code: 'CS 341', room: 'B-204' }, { time: '12:00', code: 'EDU 210', room: 'A-112' }] },
  { day: 'Monday', classes: [{ time: '10:30', code: 'CS 315', room: 'Lab 3' }, { time: '14:00', code: 'TOUR 102', room: 'C-301' }] },
  { day: 'Tuesday', classes: [{ time: '09:00', code: 'CS 322', room: 'B-107' }, { time: '12:30', code: 'CS 341', room: 'B-204' }] },
  { day: 'Wednesday', classes: [{ time: '10:30', code: 'CS 315', room: 'Lab 3' }, { time: '14:00', code: 'EDU 210', room: 'A-112' }] },
  { day: 'Thursday', classes: [{ time: '09:00', code: 'CS 322', room: 'B-107' }] },
];

export const gpaTrend = [
  { term: 'F23', value: 3.32 },
  { term: 'S24', value: 3.48 },
  { term: 'F24', value: 3.61 },
  { term: 'S25', value: 3.74 },
  { term: 'F25', value: 3.82 },
];

export const enrollmentByFaculty = [
  { name: 'Education', value: 34 },
  { name: 'Tourism', value: 18 },
  { name: 'Al-Alsun', value: 16 },
  { name: 'Computers & AI', value: 32 },
];

export const gradeDistribution = [
  { grade: 'A', value: 28 },
  { grade: 'B+', value: 34 },
  { grade: 'B', value: 22 },
  { grade: 'C+', value: 11 },
  { grade: 'C', value: 5 },
];
