import { Injectable, inject, signal } from '@angular/core';
import {
  Course,
  Faculty,
  StaffMember,
  Student,
} from '../data/mock-data';
import {
  ApiAnnouncement,
  ApiCollegeAdmin,
  ApiCourse,
  ApiDepartment,
  ApiExam,
  ApiFaculty,
  ApiFeeAccount,
  ApiStaff,
  ApiStudent,
  UniversityApiService,
} from './university-api.service';

export interface Department {
  id: string;
  apiId: string;
  name: string;
  faculty: string;
  facultyId: string;
  head: string;
  programs: number;
  status: 'Active' | 'Inactive';
}

export interface CollegeAdmin {
  id: string;
  apiId: string;
  name: string;
  faculty: string;
  facultyId: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface ExamRecord {
  id: string;
  apiId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  venue: string;
  seats: number;
  status: 'Scheduled' | 'Pending' | 'Completed';
}

export interface Announcement {
  id: string;
  apiId: string;
  title: string;
  body: string;
  audience: string;
  date: string;
  publishedOn: string;
}

export type UiStudent = Student & { apiId: string; facultyId: string };
export type UiStaff = StaffMember & { apiId: string };
export type UiFaculty = Faculty & {
  apiId: string;
  status?: string;
  enabled?: boolean;
  imageUrl?: string;
  description?: string;
  slug?: string;
};
export type UiCourse = Course & { apiId: string; department?: string; enabled?: boolean };

@Injectable({ providedIn: 'root' })
export class UniversityStore {
  private readonly api = inject(UniversityApiService);

  readonly loaded = signal(false);
  readonly students = signal<UiStudent[]>([]);
  readonly staff = signal<UiStaff[]>([]);
  readonly faculties = signal<UiFaculty[]>([]);
  readonly courses = signal<UiCourse[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly collegeAdmins = signal<CollegeAdmin[]>([]);
  readonly exams = signal<ExamRecord[]>([]);
  readonly announcements = signal<Announcement[]>([]);
  readonly feeStatus = signal({
    tuition: 'EGP 0',
    paid: 'EGP 0',
    due: 'EGP 0',
    dueDate: '',
    status: 'Unknown',
    studentApiId: '' as string,
    balance: 0,
  });
  readonly currentStudentApiId = signal<string>('');
  readonly registeredCourseCodes = signal<string[]>([]);
  readonly registrationOpen = signal(true);
  readonly creditLimit = signal(18);
  readonly adminStats = signal({
    totalStudents: 0,
    totalStaff: 0,
    activeCourses: 0,
    faculties: 0,
    enrollmentRate: 0,
  });

  async loadAll(studentUniversityId?: string): Promise<void> {
    const [students, staff, faculties, departments, courses, admins, exams, announcements] =
      await Promise.all([
        this.api.getStudents(),
        this.api.getStaff(),
        this.api.getFaculties(),
        this.api.getDepartments(),
        this.api.getCourses(),
        this.api.getCollegeAdmins(),
        this.api.getExams(),
        this.api.getAnnouncements(),
      ]);

    this.students.set(students.map(mapStudent));
    this.staff.set(staff.map(mapStaff));
    this.faculties.set(faculties.map(mapFaculty));
    this.departments.set(departments.map(mapDepartment));
    this.courses.set(courses.map(mapCourse));
    this.collegeAdmins.set(admins.map(mapAdmin));
    this.exams.set(exams.map(mapExam));
    this.announcements.set(announcements.map(mapAnnouncement));
    this.loaded.set(true);

    try {
      const window = await this.api.getRegistration();
      this.registrationOpen.set(window.isOpen);
      this.creditLimit.set(window.creditLimit);
    } catch {
      /* optional for non-admin */
    }

    try {
      const stats = await this.api.getAdminDashboard();
      this.adminStats.set(stats);
    } catch {
      /* admin-only */
    }

    const student = studentUniversityId
      ? students.find((s) => s.universityId === studentUniversityId)
      : undefined;
    if (student) {
      this.currentStudentApiId.set(student.id);
      try {
        const fees = await this.api.getFees(student.id);
        this.feeStatus.set(mapFees(fees));
      } catch {
        /* fees may be missing for non-seeded students */
      }
      try {
        const enrollments = await this.api.getEnrollments(student.id);
        this.registeredCourseCodes.set(enrollments.map((e) => e.courseCode));
      } catch {
        this.registeredCourseCodes.set([]);
      }
    } else {
      this.currentStudentApiId.set('');
      this.registeredCourseCodes.set([]);
    }
  }

  async registerCourse(courseCode: string): Promise<void> {
    const studentId = this.currentStudentApiId();
    const course = this.courses().find((c) => c.code === courseCode);
    if (!studentId || !course?.apiId) throw new Error('Missing student or course');
    await this.api.registerCourse(studentId, course.apiId);
    this.registeredCourseCodes.update((list) =>
      list.includes(courseCode) ? list : [...list, courseCode]
    );
  }

  async dropCourse(courseCode: string): Promise<void> {
    const studentId = this.currentStudentApiId();
    const course = this.courses().find((c) => c.code === courseCode);
    if (!studentId || !course?.apiId) throw new Error('Missing student or course');
    await this.api.dropCourse(studentId, course.apiId);
    this.registeredCourseCodes.update((list) => list.filter((c) => c !== courseCode));
  }

  async setRegistrationOpen(isOpen: boolean): Promise<void> {
    const window = await this.api.setRegistrationOpen(isOpen);
    this.registrationOpen.set(window.isOpen);
    this.creditLimit.set(window.creditLimit);
  }

  private facultyIdByName(name: string): string {
    const f = this.faculties().find((x) => x.name === name);
    if (!f?.apiId) throw new Error(`Faculty "${name}" not found`);
    return f.apiId;
  }

  private courseApiIdByCode(code: string): string {
    const c = this.courses().find((x) => x.code === code);
    if (!c?.apiId) throw new Error(`Course "${code}" not found`);
    return c.apiId;
  }

  async addStudent(student: Student): Promise<void> {
    const created = await this.api.createStudent({
      universityId: student.id || undefined,
      fullName: student.name,
      facultyId: this.facultyIdByName(student.faculty),
      level: student.level,
      gpa: Number(student.gpa) || 0,
      status: student.status || 'Active',
    });
    this.students.update((list) => [mapStudent(created), ...list]);
  }

  async updateStudent(id: string, patch: Partial<Student>): Promise<void> {
    const current = this.students().find((s) => s.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateStudent(current.apiId, {
      fullName: next.name,
      facultyId: this.facultyIdByName(next.faculty),
      level: next.level,
      gpa: Number(next.gpa) || 0,
      status: next.status || 'Active',
    });
    this.students.update((list) => list.map((s) => (s.id === id ? mapStudent(updated) : s)));
  }

  async deleteStudent(id: string): Promise<void> {
    const current = this.students().find((s) => s.id === id);
    if (!current) return;
    await this.api.deleteStudent(current.apiId);
    this.students.update((list) => list.filter((s) => s.id !== id));
  }

  async addStaff(member: StaffMember): Promise<void> {
    const created = await this.api.createStaff({
      staffCode: member.id || undefined,
      fullName: member.name,
      roleTitle: member.role,
      departmentName: member.department,
      contract: toContractEnum(member.contract),
      sinceYear: Number(member.since) || new Date().getFullYear(),
    });
    this.staff.update((list) => [mapStaff(created), ...list]);
  }

  async updateStaff(id: string, patch: Partial<StaffMember>): Promise<void> {
    const current = this.staff().find((s) => s.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateStaff(current.apiId, {
      fullName: next.name,
      roleTitle: next.role,
      departmentName: next.department,
      contract: toContractEnum(next.contract),
      sinceYear: Number(next.since) || new Date().getFullYear(),
    });
    this.staff.update((list) => list.map((s) => (s.id === id ? mapStaff(updated) : s)));
  }

  async deleteStaff(id: string): Promise<void> {
    const current = this.staff().find((s) => s.id === id);
    if (!current) return;
    await this.api.deleteStaff(current.apiId);
    this.staff.update((list) => list.filter((s) => s.id !== id));
  }

  async addFaculty(
    faculty: Faculty & { status?: string; enabled?: boolean; imageUrl?: string; description?: string; slug?: string }
  ): Promise<void> {
    const created = await this.api.createFaculty({
      name: faculty.name,
      arabicName: faculty.arabic,
      dean: faculty.dean,
      departmentCount: Number(faculty.departments) || 1,
      studentCount: Number(String(faculty.students).replace(/[^\d]/g, '')) || 0,
      description: faculty.description,
      imageUrl: faculty.imageUrl,
      slug: faculty.slug,
    });
    this.faculties.update((list) => [mapFaculty(created), ...list]);
  }

  async updateFaculty(
    name: string,
    patch: Partial<Faculty & { status?: string; enabled?: boolean; imageUrl?: string; description?: string; slug?: string }>
  ): Promise<void> {
    const current = this.faculties().find((f) => f.name === name);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateFaculty(current.apiId, {
      name: next.name,
      arabicName: next.arabic,
      dean: next.dean,
      departmentCount: Number(next.departments) || 1,
      studentCount: Number(String(next.students).replace(/[^\d]/g, '')) || 0,
      description: next.description,
      imageUrl: next.imageUrl,
      slug: next.slug,
    });
    this.faculties.update((list) => list.map((f) => (f.name === name ? mapFaculty(updated) : f)));
  }

  async deleteFaculty(name: string): Promise<void> {
    const current = this.faculties().find((f) => f.name === name);
    if (!current) return;
    await this.api.deleteFaculty(current.apiId);
    this.faculties.update((list) => list.filter((f) => f.name !== name));
  }

  async toggleFaculty(name: string): Promise<void> {
    const current = this.faculties().find((f) => f.name === name);
    if (!current) return;
    const updated = await this.api.toggleFaculty(current.apiId);
    this.faculties.update((list) => list.map((f) => (f.name === name ? mapFaculty(updated) : f)));
  }

  async addDepartment(dept: Omit<Department, 'apiId' | 'facultyId'> & { facultyId?: string }): Promise<void> {
    const facultyId = dept.facultyId || this.facultyIdByName(dept.faculty);
    const created = await this.api.createDepartment({
      code: dept.id || undefined,
      name: dept.name,
      facultyId,
      head: dept.head,
      programs: dept.programs,
    });
    this.departments.update((list) => [mapDepartment(created), ...list]);
  }

  async updateDepartment(id: string, patch: Partial<Department>): Promise<void> {
    const current = this.departments().find((d) => d.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateDepartment(current.apiId, {
      name: next.name,
      head: next.head,
      programs: next.programs,
      status: next.status,
    });
    this.departments.update((list) => list.map((d) => (d.id === id ? mapDepartment(updated) : d)));
  }

  async deleteDepartment(id: string): Promise<void> {
    const current = this.departments().find((d) => d.id === id);
    if (!current) return;
    await this.api.deleteDepartment(current.apiId);
    this.departments.update((list) => list.filter((d) => d.id !== id));
  }

  async addCollegeAdmin(admin: Omit<CollegeAdmin, 'apiId' | 'facultyId'> & { facultyId?: string }): Promise<void> {
    const facultyId = admin.facultyId || this.facultyIdByName(admin.faculty);
    const created = await this.api.createCollegeAdmin({
      code: admin.id || undefined,
      fullName: admin.name,
      facultyId,
      email: admin.email,
    });
    this.collegeAdmins.update((list) => [mapAdmin(created), ...list]);
  }

  async updateCollegeAdmin(id: string, patch: Partial<CollegeAdmin>): Promise<void> {
    const current = this.collegeAdmins().find((a) => a.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateCollegeAdmin(current.apiId, {
      fullName: next.name,
      facultyId: next.facultyId || this.facultyIdByName(next.faculty),
      email: next.email,
    });
    this.collegeAdmins.update((list) => list.map((a) => (a.id === id ? mapAdmin(updated) : a)));
  }

  async deleteCollegeAdmin(id: string): Promise<void> {
    const current = this.collegeAdmins().find((a) => a.id === id);
    if (!current) return;
    await this.api.deleteCollegeAdmin(current.apiId);
    this.collegeAdmins.update((list) => list.filter((a) => a.id !== id));
  }

  async toggleCollegeAdmin(id: string): Promise<void> {
    const current = this.collegeAdmins().find((a) => a.id === id);
    if (!current) return;
    const updated = await this.api.toggleCollegeAdmin(current.apiId);
    this.collegeAdmins.update((list) => list.map((a) => (a.id === id ? mapAdmin(updated) : a)));
  }

  async addCourse(course: Course & { department?: string; enabled?: boolean }): Promise<void> {
    const created = await this.api.createCourse({
      code: course.code,
      name: course.name,
      arabicName: course.arabic,
      instructorName: course.instructor,
      room: course.room,
      credits: course.credits,
      departmentName: course.department || 'General',
    });
    this.courses.update((list) => [mapCourse(created), ...list]);
  }

  async updateCourse(
    code: string,
    patch: Partial<Course & { department?: string; enabled?: boolean }>
  ): Promise<void> {
    const current = this.courses().find((c) => c.code === code);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateCourse(current.apiId, {
      name: next.name,
      arabicName: next.arabic,
      instructorName: next.instructor,
      room: next.room,
      credits: next.credits,
      departmentName: next.department || 'General',
    });
    this.courses.update((list) => list.map((c) => (c.code === code ? mapCourse(updated) : c)));
  }

  async deleteCourse(code: string): Promise<void> {
    const current = this.courses().find((c) => c.code === code);
    if (!current) return;
    await this.api.deleteCourse(current.apiId);
    this.courses.update((list) => list.filter((c) => c.code !== code));
  }

  async toggleCourse(code: string): Promise<void> {
    const current = this.courses().find((c) => c.code === code);
    if (!current) return;
    const updated = await this.api.toggleCourse(current.apiId);
    this.courses.update((list) => list.map((c) => (c.code === code ? mapCourse(updated) : c)));
  }

  async addExam(exam: {
    courseCode: string;
    courseName: string;
    date: string;
    time: string;
    venue: string;
    seats: number;
    status?: string;
  }): Promise<void> {
    const courseId = this.courseApiIdByCode(exam.courseCode);
    const created = await this.api.createExam({
      courseId,
      examDate: toIsoDate(exam.date),
      examTime: normalizeTime(exam.time),
      venue: exam.venue,
      seats: exam.seats,
    });
    this.exams.update((list) => [mapExam(created), ...list]);
  }

  async updateExam(id: string, patch: Partial<ExamRecord>): Promise<void> {
    const current = this.exams().find((e) => e.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateExam(current.apiId, {
      examDate: toIsoDate(next.date),
      examTime: normalizeTime(next.time),
      venue: next.venue,
      seats: next.seats,
      status: next.status,
    });
    this.exams.update((list) => list.map((e) => (e.id === id ? mapExam(updated) : e)));
  }

  async deleteExam(id: string): Promise<void> {
    const current = this.exams().find((e) => e.id === id);
    if (!current) return;
    await this.api.deleteExam(current.apiId);
    this.exams.update((list) => list.filter((e) => e.id !== id));
  }

  async addAnnouncement(item: { title: string; body: string; audience: string; date?: string }): Promise<void> {
    const publishedOn = item.date ? toIsoDate(item.date) : new Date().toISOString().slice(0, 10);
    const created = await this.api.createAnnouncement({
      title: item.title,
      body: item.body,
      audience: item.audience,
      publishedOn,
    });
    this.announcements.update((list) => [mapAnnouncement(created), ...list]);
  }

  async updateAnnouncement(id: string, patch: Partial<Announcement>): Promise<void> {
    const current = this.announcements().find((a) => a.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const updated = await this.api.updateAnnouncement(current.apiId, {
      title: next.title,
      body: next.body,
      audience: next.audience,
      publishedOn: next.publishedOn || toIsoDate(next.date),
    });
    this.announcements.update((list) =>
      list.map((a) => (a.id === id ? mapAnnouncement(updated) : a))
    );
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const current = this.announcements().find((a) => a.id === id);
    if (!current) return;
    await this.api.deleteAnnouncement(current.apiId);
    this.announcements.update((list) => list.filter((a) => a.id !== id));
  }

  async payFees(): Promise<void> {
    const fees = this.feeStatus();
    if (!fees.studentApiId || fees.balance <= 0) {
      this.feeStatus.update((f) => ({ ...f, paid: f.tuition, due: 'EGP 0', status: 'Paid', balance: 0 }));
      return;
    }
    const updated = await this.api.payFees(fees.studentApiId, fees.balance);
    this.feeStatus.set(mapFees(updated));
  }
}

function mapStudent(s: ApiStudent): UiStudent {
  return {
    id: s.universityId,
    apiId: s.id,
    facultyId: s.facultyId,
    name: s.fullName,
    faculty: s.facultyName,
    level: s.level,
    gpa: Number(s.gpa).toFixed(2),
    status: s.status,
  };
}

function mapStaff(s: ApiStaff): UiStaff {
  return {
    id: s.staffCode,
    apiId: s.id,
    name: s.fullName,
    role: s.roleTitle,
    department: s.departmentName,
    contract: fromContractEnum(s.contract),
    since: String(s.sinceYear),
  };
}

function mapFaculty(f: ApiFaculty): UiFaculty {
  return {
    apiId: f.id,
    name: f.name,
    arabic: f.arabicName,
    dean: f.dean,
    departments: f.departmentCount,
    students: String(f.studentCount),
    status: f.status,
    enabled: f.isEnabled,
    imageUrl: f.imageUrl,
    description: f.description,
    slug: f.slug,
  };
}

function mapDepartment(d: ApiDepartment): Department {
  return {
    id: d.code,
    apiId: d.id,
    name: d.name,
    faculty: d.facultyName,
    facultyId: d.facultyId,
    head: d.head,
    programs: d.programs,
    status: (d.status as 'Active' | 'Inactive') || 'Active',
  };
}

function mapCourse(c: ApiCourse): UiCourse {
  return {
    apiId: c.id,
    code: c.code,
    name: c.name,
    arabic: c.arabicName,
    instructor: c.instructorName,
    room: c.room,
    credits: c.credits,
    students: c.enrolledCount,
    progress: c.progressPercent,
    department: c.departmentName,
    enabled: c.isEnabled,
  };
}

function mapAdmin(a: ApiCollegeAdmin): CollegeAdmin {
  return {
    id: a.code,
    apiId: a.id,
    name: a.fullName,
    faculty: a.facultyName,
    facultyId: a.facultyId,
    email: a.email,
    status: (a.status as 'Active' | 'Inactive') || 'Active',
  };
}

function mapExam(e: ApiExam): ExamRecord {
  return {
    id: e.id,
    apiId: e.id,
    courseId: e.courseId,
    courseCode: e.courseCode,
    courseName: e.courseName,
    date: formatDisplayDate(e.examDate),
    time: (e.examTime || '').slice(0, 5),
    venue: e.venue,
    seats: e.seats,
    status: (e.status as ExamRecord['status']) || 'Scheduled',
  };
}

function mapAnnouncement(a: ApiAnnouncement): Announcement {
  return {
    id: a.id,
    apiId: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    date: formatDisplayDate(a.publishedOn),
    publishedOn: a.publishedOn,
  };
}

function mapFees(f: ApiFeeAccount) {
  const fmt = (n: number) => `EGP ${n.toLocaleString('en-EG')}`;
  return {
    tuition: fmt(f.tuitionAmount),
    paid: fmt(f.paidAmount),
    due: fmt(f.balance),
    dueDate: formatDisplayDate(f.dueDate),
    status: f.status,
    studentApiId: f.studentId,
    balance: f.balance,
  };
}

function toContractEnum(value: string): string {
  const v = value.toLowerCase().replace(/[\s_-]/g, '');
  if (v.includes('part')) return 'PartTime';
  return 'FullTime';
}

function fromContractEnum(value: string): string {
  if (value === 'PartTime' || value === 'Part-time') return 'Part-time';
  if (value === 'FullTime' || value === 'Full-time') return 'Full-time';
  return value;
}

function toIsoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function normalizeTime(value: string): string {
  const m = value.match(/(\d{1,2}):(\d{2})/);
  if (!m) return '09:00:00';
  return `${m[1].padStart(2, '0')}:${m[2]}:00`;
}

function formatDisplayDate(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
