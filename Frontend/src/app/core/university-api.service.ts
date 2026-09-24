import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const base = () => `${environment.apiUrl}/api`;

export interface ApiStudent {
  id: string;
  universityId: string;
  fullName: string;
  facultyId: string;
  facultyName: string;
  level: string;
  gpa: number;
  status: string;
}

export interface ApiStaff {
  id: string;
  staffCode: string;
  fullName: string;
  roleTitle: string;
  departmentName: string;
  contract: string;
  sinceYear: number;
}

export interface ApiFaculty {
  id: string;
  name: string;
  arabicName: string;
  dean: string;
  departmentCount: number;
  studentCount: number;
  status: string;
  isEnabled: boolean;
  description?: string;
  imageUrl?: string;
  slug?: string;
}

export interface ApiSiteProfile {
  id: string;
  brandNameAr: string;
  brandNameEn: string;
  tagline: string;
  taglineEn: string;
  aboutIntro: string;
  aboutIntroEn: string;
  addressLines: string;
  addressLinesEn: string;
  phone: string;
  email: string;
  website: string;
  heroImageUrl: string;
  globalImageUrl: string;
  presidentName: string;
  presidentTitle: string;
  presidentTitleEn: string;
}

export interface ApiSiteNews {
  id: string;
  category: string;
  categoryEn: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  imageUrl: string;
  publishedLabel: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface ApiSiteEvent {
  id: string;
  day: string;
  month: string;
  monthEn: string;
  title: string;
  titleEn: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface ApiDepartment {
  id: string;
  code: string;
  name: string;
  facultyId: string;
  facultyName: string;
  head: string;
  programs: number;
  status: string;
}

export interface ApiCourse {
  id: string;
  code: string;
  name: string;
  arabicName: string;
  instructorName: string;
  room: string;
  credits: number;
  enrolledCount: number;
  progressPercent: number;
  departmentName: string;
  isEnabled: boolean;
  scheduleSlot?: string | null;
}

export interface ApiCollegeAdmin {
  id: string;
  code: string;
  fullName: string;
  facultyId: string;
  facultyName: string;
  email: string;
  status: string;
}

export interface ApiExam {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  examDate: string;
  examTime: string;
  venue: string;
  seats: number;
  status: string;
}

export interface ApiAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedOn: string;
}

export interface ApiFeeAccount {
  id: string;
  studentId: string;
  semester: string;
  tuitionAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class UniversityApiService {
  private readonly http = inject(HttpClient);

  getStudents() {
    return firstValueFrom(this.http.get<ApiStudent[]>(`${base()}/students`));
  }
  createStudent(body: {
    universityId?: string;
    fullName: string;
    facultyId: string;
    level: string;
    gpa: number;
    status: string;
  }) {
    return firstValueFrom(this.http.post<ApiStudent>(`${base()}/students`, body));
  }
  updateStudent(
    id: string,
    body: { fullName: string; facultyId: string; level: string; gpa: number; status: string }
  ) {
    return firstValueFrom(this.http.put<ApiStudent>(`${base()}/students/${id}`, body));
  }
  deleteStudent(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/students/${id}`));
  }

  getStaff() {
    return firstValueFrom(this.http.get<ApiStaff[]>(`${base()}/staff`));
  }
  createStaff(body: {
    staffCode?: string;
    fullName: string;
    roleTitle: string;
    departmentName: string;
    contract: string;
    sinceYear: number;
  }) {
    return firstValueFrom(this.http.post<ApiStaff>(`${base()}/staff`, body));
  }
  updateStaff(
    id: string,
    body: {
      fullName: string;
      roleTitle: string;
      departmentName: string;
      contract: string;
      sinceYear: number;
    }
  ) {
    return firstValueFrom(this.http.put<ApiStaff>(`${base()}/staff/${id}`, body));
  }
  deleteStaff(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/staff/${id}`));
  }

  getFaculties() {
    return firstValueFrom(this.http.get<ApiFaculty[]>(`${base()}/faculties`));
  }
  createFaculty(body: {
    name: string;
    arabicName: string;
    dean: string;
    departmentCount: number;
    studentCount: number;
    description?: string;
    imageUrl?: string;
    slug?: string;
  }) {
    return firstValueFrom(this.http.post<ApiFaculty>(`${base()}/faculties`, body));
  }
  updateFaculty(
    id: string,
    body: {
      name: string;
      arabicName: string;
      dean: string;
      departmentCount: number;
      studentCount: number;
      description?: string;
      imageUrl?: string;
      slug?: string;
    }
  ) {
    return firstValueFrom(this.http.put<ApiFaculty>(`${base()}/faculties/${id}`, body));
  }
  deleteFaculty(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/faculties/${id}`));
  }
  toggleFaculty(id: string) {
    return firstValueFrom(this.http.post<ApiFaculty>(`${base()}/faculties/${id}/toggle`, {}));
  }

  getDepartments() {
    return firstValueFrom(this.http.get<ApiDepartment[]>(`${base()}/departments`));
  }
  createDepartment(body: {
    code?: string;
    name: string;
    facultyId: string;
    head: string;
    programs: number;
  }) {
    return firstValueFrom(this.http.post<ApiDepartment>(`${base()}/departments`, body));
  }
  updateDepartment(
    id: string,
    body: { name: string; head: string; programs: number; status: string }
  ) {
    return firstValueFrom(this.http.put<ApiDepartment>(`${base()}/departments/${id}`, body));
  }
  deleteDepartment(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/departments/${id}`));
  }

  getCourses() {
    return firstValueFrom(this.http.get<ApiCourse[]>(`${base()}/courses`));
  }
  createCourse(body: {
    code: string;
    name: string;
    arabicName: string;
    instructorName: string;
    room: string;
    credits: number;
    departmentName: string;
    scheduleSlot?: string;
  }) {
    return firstValueFrom(this.http.post<ApiCourse>(`${base()}/courses`, body));
  }
  updateCourse(
    id: string,
    body: {
      name: string;
      arabicName: string;
      instructorName: string;
      room: string;
      credits: number;
      departmentName: string;
      scheduleSlot?: string;
    }
  ) {
    return firstValueFrom(this.http.put<ApiCourse>(`${base()}/courses/${id}`, body));
  }
  deleteCourse(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/courses/${id}`));
  }
  toggleCourse(id: string) {
    return firstValueFrom(this.http.post<ApiCourse>(`${base()}/courses/${id}/toggle`, {}));
  }

  getCollegeAdmins() {
    return firstValueFrom(this.http.get<ApiCollegeAdmin[]>(`${base()}/collegeadmins`));
  }
  createCollegeAdmin(body: { code?: string; fullName: string; facultyId: string; email: string }) {
    return firstValueFrom(this.http.post<ApiCollegeAdmin>(`${base()}/collegeadmins`, body));
  }
  updateCollegeAdmin(id: string, body: { fullName: string; facultyId: string; email: string }) {
    return firstValueFrom(this.http.put<ApiCollegeAdmin>(`${base()}/collegeadmins/${id}`, body));
  }
  deleteCollegeAdmin(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/collegeadmins/${id}`));
  }
  toggleCollegeAdmin(id: string) {
    return firstValueFrom(this.http.post<ApiCollegeAdmin>(`${base()}/collegeadmins/${id}/toggle`, {}));
  }

  getExams() {
    return firstValueFrom(this.http.get<ApiExam[]>(`${base()}/exams`));
  }
  createExam(body: {
    courseId: string;
    examDate: string;
    examTime: string;
    venue: string;
    seats: number;
  }) {
    return firstValueFrom(this.http.post<ApiExam>(`${base()}/exams`, body));
  }
  updateExam(
    id: string,
    body: {
      examDate: string;
      examTime: string;
      venue: string;
      seats: number;
      status: string;
    }
  ) {
    return firstValueFrom(this.http.put<ApiExam>(`${base()}/exams/${id}`, body));
  }
  deleteExam(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/exams/${id}`));
  }

  getAnnouncements() {
    return firstValueFrom(this.http.get<ApiAnnouncement[]>(`${base()}/announcements`));
  }
  createAnnouncement(body: {
    title: string;
    body: string;
    audience: string;
    publishedOn: string;
  }) {
    return firstValueFrom(this.http.post<ApiAnnouncement>(`${base()}/announcements`, body));
  }
  updateAnnouncement(
    id: string,
    body: { title: string; body: string; audience: string; publishedOn: string }
  ) {
    return firstValueFrom(this.http.put<ApiAnnouncement>(`${base()}/announcements/${id}`, body));
  }
  deleteAnnouncement(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/announcements/${id}`));
  }

  getFees(studentId: string) {
    return firstValueFrom(this.http.get<ApiFeeAccount>(`${base()}/fees/students/${studentId}`));
  }
  payFees(studentId: string, amount: number) {
    return firstValueFrom(
      this.http.post<ApiFeeAccount>(`${base()}/fees/students/${studentId}/pay`, { amount })
    );
  }

  getEnrollments(studentId: string) {
    return firstValueFrom(
      this.http.get<
        {
          courseId: string;
          courseCode: string;
          courseName: string;
          credits: number;
          status: string;
          scheduleSlot?: string | null;
        }[]
      >(`${base()}/courses/enrollments/${studentId}`)
    );
  }
  registerCourse(studentId: string, courseId: string) {
    return firstValueFrom(
      this.http.post(`${base()}/courses/register`, { studentId, courseId })
    );
  }
  dropCourse(studentId: string, courseId: string) {
    return firstValueFrom(this.http.post(`${base()}/courses/drop`, { studentId, courseId }));
  }

  getRegistration() {
    return firstValueFrom(
      this.http.get<{ id: string; semester: string; isOpen: boolean; closesOn: string; creditLimit: number }>(
        `${base()}/registration`
      )
    );
  }
  setRegistrationOpen(isOpen: boolean) {
    return firstValueFrom(
      this.http.put<{ id: string; semester: string; isOpen: boolean; closesOn: string; creditLimit: number }>(
        `${base()}/registration`,
        { isOpen }
      )
    );
  }

  getAdminDashboard() {
    return firstValueFrom(
      this.http.get<{
        totalStudents: number;
        totalStaff: number;
        activeCourses: number;
        faculties: number;
        enrollmentRate: number;
      }>(`${base()}/dashboards/admin`)
    );
  }

  getNotifications() {
    return firstValueFrom(
      this.http.get<
        {
          id: string;
          title: string;
          body: string;
          href?: string | null;
          isRead: boolean;
          createdAtUtc: string;
        }[]
      >(`${base()}/notifications`)
    );
  }
  markNotificationRead(id: string) {
    return firstValueFrom(this.http.post(`${base()}/notifications/${id}/read`, {}));
  }
  markAllNotificationsRead() {
    return firstValueFrom(this.http.post(`${base()}/notifications/read-all`, {}));
  }

  getCourseGrades(courseId: string) {
    return firstValueFrom(
      this.http.get<
        {
          id: string;
          courseId: string;
          courseCode: string;
          studentId: string;
          studentName: string;
          midterm: number;
          coursework: number;
          final: number;
          total: number;
          letter: string;
          publishStatus: string;
        }[]
      >(`${base()}/grades/courses/${courseId}`)
    );
  }
  upsertGrade(body: {
    courseId: string;
    studentId: string;
    midterm: number;
    coursework: number;
    final: number;
  }) {
    return firstValueFrom(this.http.put(`${base()}/grades`, body));
  }
  publishCourseGrades(courseId: string) {
    return firstValueFrom(this.http.post(`${base()}/grades/courses/${courseId}/publish`, {}));
  }

  getExamSeats(examId: string) {
    return firstValueFrom(
      this.http.get<{ studentId: string; studentName: string; universityId: string; seatNumber: string }[]>(
        `${base()}/exams/${examId}/seats`
      )
    );
  }
  assignExamSeat(examId: string, body: { studentId: string; seatNumber: string }) {
    return firstValueFrom(this.http.post(`${base()}/exams/${examId}/seats`, body));
  }

  getCmsProfile() {
    return firstValueFrom(this.http.get<ApiSiteProfile>(`${base()}/cms/profile`));
  }
  updateCmsProfile(body: Omit<ApiSiteProfile, 'id'>) {
    return firstValueFrom(this.http.put<ApiSiteProfile>(`${base()}/cms/profile`, body));
  }
  getCmsNews() {
    return firstValueFrom(this.http.get<ApiSiteNews[]>(`${base()}/cms/news`));
  }
  createCmsNews(body: {
    category: string;
    categoryEn: string;
    title: string;
    titleEn: string;
    summary: string;
    summaryEn: string;
    imageUrl: string;
    publishedLabel: string;
    isFeatured: boolean;
    sortOrder: number;
  }) {
    return firstValueFrom(this.http.post<ApiSiteNews>(`${base()}/cms/news`, body));
  }
  updateCmsNews(
    id: string,
    body: {
      category: string;
      categoryEn: string;
      title: string;
      titleEn: string;
      summary: string;
      summaryEn: string;
      imageUrl: string;
      publishedLabel: string;
      isFeatured: boolean;
      isPublished: boolean;
      sortOrder: number;
    }
  ) {
    return firstValueFrom(this.http.put<ApiSiteNews>(`${base()}/cms/news/${id}`, body));
  }
  deleteCmsNews(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/cms/news/${id}`));
  }
  getCmsEvents() {
    return firstValueFrom(this.http.get<ApiSiteEvent[]>(`${base()}/cms/events`));
  }
  createCmsEvent(body: {
    day: string;
    month: string;
    monthEn: string;
    title: string;
    titleEn: string;
    location: string;
    locationEn: string;
    category: string;
    categoryEn: string;
    sortOrder: number;
  }) {
    return firstValueFrom(this.http.post<ApiSiteEvent>(`${base()}/cms/events`, body));
  }
  updateCmsEvent(
    id: string,
    body: {
      day: string;
      month: string;
      monthEn: string;
      title: string;
      titleEn: string;
      location: string;
      locationEn: string;
      category: string;
      categoryEn: string;
      isPublished: boolean;
      sortOrder: number;
    }
  ) {
    return firstValueFrom(this.http.put<ApiSiteEvent>(`${base()}/cms/events/${id}`, body));
  }
  deleteCmsEvent(id: string) {
    return firstValueFrom(this.http.delete(`${base()}/cms/events/${id}`));
  }

  createAttendanceSession(body: { courseId: string; sessionDate: string }) {
    return firstValueFrom(this.http.post<string>(`${base()}/attendance/sessions`, body));
  }
  markAttendance(sessionId: string, body: { studentId: string; isPresent: boolean }) {
    return firstValueFrom(this.http.post(`${base()}/attendance/sessions/${sessionId}/mark`, body));
  }
  submitAttendance(sessionId: string) {
    return firstValueFrom(this.http.post(`${base()}/attendance/sessions/${sessionId}/submit`, {}));
  }

  uploadMedia(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return firstValueFrom(
      this.http.post<{
        url: string;
        relativeUrl: string;
        fileName: string;
        contentType: string;
        sizeBytes: number;
      }>(`${base()}/media/upload`, form)
    );
  }
}
