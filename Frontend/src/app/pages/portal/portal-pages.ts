import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideBookOpen,
  LucideCalendarDays,
  LucideCheck,
  LucideDownload,
  LucideFilter,
  LucidePlus,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideUserPlus,
} from '@lucide/angular';
import { ToastService } from '../../core/toast.service';
import { UniversityApiService } from '../../core/university-api.service';
import { UniversityStore } from '../../core/university-store.service';
import { weekSchedule } from '../../data/mock-data';
import {
  PageHeaderComponent,
  PanelComponent,
  ProgressComponent,
  StatusComponent,
} from '../../shared/ui.components';
import { DrawerComponent, ModalComponent } from '../../shared/overlay.components';

/** Slot conflicts used for student registration checks */
const courseSlots: Record<string, string> = {
  'CS 341': 'Sun-09:00',
  'CS 315': 'Mon-10:30',
  'MTH 203': 'Sun-12:00',
  'CS 322': 'Tue-09:00',
  'HUM 102': 'Mon-14:00',
  'CS 350': 'Sun-09:00',
};

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatusComponent,
    ProgressComponent,
    DrawerComponent,
    ModalComponent,
    FormsModule,
    LucidePlus,
    LucideSearch,
    LucideFilter,
    LucideSlidersHorizontal,
    LucideCheck,
  ],
  templateUrl: './courses-page.component.html',
})
export class CoursesPageComponent {
  role = input('student');
  private store = inject(UniversityStore);
  private toast = inject(ToastService);

  courses = computed(() => this.store.courses());
  registered = computed(() => this.store.registeredCourseCodes());
  rosterOpen = signal(false);
  selectedCourse = signal<any | null>(null);
  modalOpen = signal(false);
  editingCode = signal<string | null>(null);
  form = signal({ code: '', name: '', arabic: '', instructor: '', room: '', credits: '3', department: 'Computer Science' });
  creditLimit = computed(() => this.store.creditLimit());
  rosterStudents = computed(() => this.store.students());

  title = computed(() => {
    const role = this.role();
    return role === 'admin' ? 'Course catalog' : role === 'instructor' ? 'My courses' : 'Course registration';
  });

  subtitle = computed(() =>
    this.role() === 'admin'
      ? 'Manage university courses, departments and availability.'
      : 'Review course details, sections and semester progress.'
  );

  registeredCredits = computed(() =>
    this.courses()
      .filter((c) => this.registered().includes(c.code))
      .reduce((sum, c) => sum + c.credits, 0)
  );

  isRegistered(code: string): boolean {
    return this.registered().includes(code);
  }

  hasConflict(code: string): string | null {
    const course = this.courses().find((c) => c.code === code);
    const slot = (course as any)?.scheduleSlot || courseSlots[code];
    if (!slot) return null;
    const conflict = this.registered().find((r) => {
      if (r === code) return false;
      const other = this.courses().find((c) => c.code === r);
      const otherSlot = (other as any)?.scheduleSlot || courseSlots[r];
      return otherSlot === slot;
    });
    return conflict || null;
  }

  async toggleRegister(code: string): Promise<void> {
    try {
      if (this.isRegistered(code)) {
        await this.store.dropCourse(code);
        this.toast.info('Course dropped', code);
        return;
      }
      const conflict = this.hasConflict(code);
      if (conflict) {
        this.toast.danger('Schedule conflict', `${code} overlaps with ${conflict}.`);
        return;
      }
      const course = this.courses().find((c) => c.code === code);
      if (course && this.registeredCredits() + course.credits > this.creditLimit()) {
        this.toast.warning('Credit limit exceeded', `Maximum ${this.creditLimit()} credit hours.`);
        return;
      }
      if (!this.store.registrationOpen()) {
        this.toast.warning('Registration closed', 'The add/drop window is not open.');
        return;
      }
      await this.store.registerCourse(code);
      this.toast.success('Course registered', code);
    } catch {
      this.toast.warning('Registration failed', 'Sign in as student and ensure the window is open.');
    }
  }

  openRoster(course: any): void {
    this.selectedCourse.set(course);
    this.rosterOpen.set(true);
  }

  openAddCourse(): void {
    this.editingCode.set(null);
    this.form.set({ code: '', name: '', arabic: '', instructor: '', room: '', credits: '3', department: 'Computer Science' });
    this.modalOpen.set(true);
  }

  openEditCourse(course: any): void {
    this.editingCode.set(course.code);
    this.form.set({
      code: course.code,
      name: course.name,
      arabic: course.arabic,
      instructor: course.instructor,
      room: course.room,
      credits: String(course.credits),
      department: course.department || 'Computer Science',
    });
    this.modalOpen.set(true);
  }

  async saveCourse(): Promise<void> {
    const f = this.form();
    if (!f.code || !f.name) {
      this.toast.warning('Code and name are required');
      return;
    }
    try {
      if (this.editingCode()) {
        await this.store.updateCourse(this.editingCode()!, {
          name: f.name,
          arabic: f.arabic || f.name,
          instructor: f.instructor || 'TBD',
          room: f.room || 'TBD',
          credits: Number(f.credits) || 3,
          department: f.department,
        });
        this.toast.success('Course updated', f.code);
      } else {
        await this.store.addCourse({
          code: f.code,
          name: f.name,
          arabic: f.arabic || f.name,
          instructor: f.instructor || 'TBD',
          room: f.room || 'TBD',
          credits: Number(f.credits) || 3,
          students: 0,
          progress: 0,
          department: f.department,
          enabled: true,
        });
        this.toast.success('Course added', f.code);
      }
      this.modalOpen.set(false);
      this.editingCode.set(null);
    } catch {
      this.toast.warning('Could not save course', 'Check API connection and try again.');
    }
  }

  async removeCourse(code: string): Promise<void> {
    try {
      await this.store.deleteCourse(code);
      this.toast.info('Course deleted', code);
    } catch {
      this.toast.warning('Could not delete course', 'Check API connection and try again.');
    }
  }

  async toggleEnabled(code: string): Promise<void> {
    try {
      await this.store.toggleCourse(code);
      this.toast.info('Course availability updated', code);
    } catch {
      this.toast.warning('Could not update course', 'Check API connection and try again.');
    }
  }

  setCourseField(key: string, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((v) => v[0])
      .slice(0, 2)
      .join('');
  }
}

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [PageHeaderComponent, PanelComponent, LucideDownload],
  templateUrl: './schedule-page.component.html',
})
export class SchedulePageComponent {
  weekSchedule = weekSchedule;
}

@Component({
  selector: 'app-grades-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, PanelComponent, LucideCheck, LucideDownload],
  templateUrl: './grades-page.component.html',
})
export class GradesPageComponent {
  instructor = input(false);
  saved = signal(false);
  published = signal(false);
  private store = inject(UniversityStore);
  private api = inject(UniversityApiService);
  private toast = inject(ToastService);
  students = this.store.students;
  courses = this.store.courses;
  selectedCourseId = signal('');
  rows = signal<{ studentId: string; name: string; mid: number; work: number; final: number; letter: string }[]>([]);
  private gradesBootstrapped = false;

  constructor() {
    // Wait until courses hydrate from the API — ngOnInit often runs with [].
    effect(() => {
      const list = this.courses();
      if (this.gradesBootstrapped || !list.length) return;
      this.gradesBootstrapped = true;
      const first = list[0];
      untracked(() => {
        this.selectedCourseId.set(first.apiId);
        void this.loadGrades(first.apiId);
      });
    });
  }

  async loadGrades(courseId: string): Promise<void> {
    this.selectedCourseId.set(courseId);
    try {
      const grades = await this.api.getCourseGrades(courseId);
      if (grades.length) {
        this.rows.set(
          grades.map((g) => ({
            studentId: g.studentId,
            name: g.studentName,
            mid: g.midterm,
            work: g.coursework,
            final: g.final,
            letter: g.letter,
          }))
        );
        this.published.set(grades.every((g) => g.publishStatus === 'Published'));
      } else {
        this.rows.set(
          this.students().map((s) => ({
            studentId: s.apiId,
            name: s.name,
            mid: 0,
            work: 0,
            final: 0,
            letter: '',
          }))
        );
      }
    } catch {
      this.rows.set(
        this.students().map((s) => ({
          studentId: s.apiId,
          name: s.name,
          mid: 0,
          work: 0,
          final: 0,
          letter: '',
        }))
      );
    }
  }

  mid(i: number): number {
    return this.rows()[i]?.mid ?? 0;
  }
  work(i: number): number {
    return this.rows()[i]?.work ?? 0;
  }
  final(i: number): number {
    return this.rows()[i]?.final ?? 0;
  }
  total(i: number): number {
    return this.mid(i) + this.work(i) + this.final(i);
  }

  setScore(i: number, field: 'mid' | 'work' | 'final', value: string): void {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    this.rows.update((list) => list.map((r, idx) => (idx === i ? { ...r, [field]: n } : r)));
    this.saved.set(false);
  }

  async saveGrades(): Promise<void> {
    const courseId = this.selectedCourseId();
    if (!courseId) return;
    try {
      for (const row of this.rows()) {
        await this.api.upsertGrade({
          courseId,
          studentId: row.studentId,
          midterm: row.mid,
          coursework: row.work,
          final: row.final,
        });
      }
      this.saved.set(true);
      this.toast.success('Grades saved', 'Draft stored securely.');
    } catch {
      this.toast.warning('Could not save grades', 'Instructor role required.');
    }
  }

  async publishGrades(): Promise<void> {
    const courseId = this.selectedCourseId();
    if (!courseId) return;
    try {
      await this.api.publishCourseGrades(courseId);
      this.published.set(true);
      this.toast.success('Grades published', 'Students can now view results.');
    } catch {
      this.toast.warning('Could not publish', 'Instructor role required.');
    }
  }
}

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    PageHeaderComponent,
    PanelComponent,
    ProgressComponent,
    StatusComponent,
    LucideCheck,
  ],
  templateUrl: './attendance-page.component.html',
})
export class AttendancePageComponent {
  instructor = input(false);
  private store = inject(UniversityStore);
  private api = inject(UniversityApiService);
  private toast = inject(ToastService);
  students = this.store.students;
  courses = this.store.courses;
  present = signal<string[]>([]);
  attendanceValues = [96, 91, 87, 94, 78];
  sessionDate = signal('2026-03-16');
  selectedCourseId = signal('');
  busy = signal(false);

  constructor() {
    this.present.set(this.store.students().map((s) => s.id));
    const first = this.store.courses()[0];
    if (first?.apiId) this.selectedCourseId.set(first.apiId);
  }

  isPresent(id: string): boolean {
    return this.present().includes(id);
  }

  togglePresent(id: string): void {
    this.present.update((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  }

  async submitAttendance(): Promise<void> {
    if (!this.instructor()) {
      this.toast.info('Attendance view', 'Student absences are shown from local session data.');
      return;
    }

    const courseId = this.selectedCourseId() || this.courses()[0]?.apiId;
    if (!courseId) {
      this.toast.warning('Select a course first');
      return;
    }

    this.busy.set(true);
    try {
      const sessionId = await this.api.createAttendanceSession({
        courseId,
        sessionDate: this.sessionDate(),
      });

      for (const student of this.students()) {
        await this.api.markAttendance(sessionId, {
          studentId: student.apiId,
          isPresent: this.isPresent(student.id),
        });
      }
      await this.api.submitAttendance(sessionId);
      this.toast.success(
        'Attendance submitted',
        `${this.present().length} present · ${this.students().length - this.present().length} absent`
      );
    } catch {
      this.toast.warning('Could not submit attendance', 'Check API connection and try again.');
    } finally {
      this.busy.set(false);
    }
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((v) => v[0])
      .slice(0, 2)
      .join('');
  }
}

@Component({
  selector: 'app-operations-page',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    PanelComponent,
    StatusComponent,
    DrawerComponent,
    ModalComponent,
    LucidePlus,
    LucideBookOpen,
  ],
  templateUrl: './operations-page.component.html',
})
export class OperationsPageComponent {
  type = input<'exams' | 'registration' | 'payroll'>('exams');
  private store = inject(UniversityStore);
  private api = inject(UniversityApiService);
  private toast = inject(ToastService);

  enabled = computed(() => this.store.registrationOpen());
  faculties = computed(() => this.store.faculties());
  staff = computed(() => this.store.staff());
  courses = computed(() => this.store.courses());
  exams = computed(() => this.store.exams());
  seatStudents = computed(() => this.store.students());
  seatOpen = signal(false);
  selectedExam = signal<any | null>(null);
  modalOpen = signal(false);
  editingExamId = signal<string | null>(null);
  form = signal({
    courseCode: '',
    courseName: '',
    date: '',
    time: '09:00',
    venue: 'Hall A',
    seats: '40',
    status: 'Scheduled',
  });
  examSeats = signal<{ studentName: string; universityId: string; seatNumber: string }[]>([]);
  seatAssign = signal({ studentId: '', seatNumber: '' });

  async toggleEnabled(): Promise<void> {
    try {
      const next = !this.store.registrationOpen();
      await this.store.setRegistrationOpen(next);
      this.toast.info(
        next ? 'Registration opened' : 'Registration closed',
        'Applied across all faculties.'
      );
    } catch {
      this.toast.warning('Could not update registration', 'Admin role required.');
    }
  }

  async openSeating(exam: any): Promise<void> {
    this.selectedExam.set(exam);
    this.seatAssign.set({ studentId: '', seatNumber: '' });
    this.seatOpen.set(true);
    await this.reloadSeats(exam);
  }

  private async reloadSeats(exam: any): Promise<void> {
    try {
      const seats = await this.api.getExamSeats(exam.apiId || exam.id);
      this.examSeats.set(seats);
    } catch {
      this.examSeats.set([]);
    }
  }

  setSeatField(key: 'studentId' | 'seatNumber', value: string): void {
    this.seatAssign.update((f) => ({ ...f, [key]: value }));
  }

  async assignSeat(): Promise<void> {
    const exam = this.selectedExam();
    const a = this.seatAssign();
    if (!exam || !a.studentId || !a.seatNumber.trim()) {
      this.toast.warning('Student and seat number are required');
      return;
    }
    try {
      await this.api.assignExamSeat(exam.apiId || exam.id, {
        studentId: a.studentId,
        seatNumber: a.seatNumber.trim(),
      });
      this.seatAssign.set({ studentId: '', seatNumber: '' });
      await this.reloadSeats(exam);
      this.toast.success('Seat assigned');
    } catch {
      this.toast.warning('Could not assign seat', 'Admin role required.');
    }
  }

  openAddExam(): void {
    this.editingExamId.set(null);
    this.form.set({
      courseCode: '',
      courseName: '',
      date: '',
      time: '09:00',
      venue: 'Hall A',
      seats: '40',
      status: 'Scheduled',
    });
    this.modalOpen.set(true);
  }

  openEditExam(exam: any): void {
    this.editingExamId.set(exam.id);
    this.form.set({
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      date: exam.date,
      time: exam.time,
      venue: exam.venue,
      seats: String(exam.seats),
      status: exam.status || 'Scheduled',
    });
    this.modalOpen.set(true);
  }

  async saveExam(): Promise<void> {
    const f = this.form();
    if (!f.courseCode || !f.date) {
      this.toast.warning('Course code and date are required');
      return;
    }
    try {
      if (this.editingExamId()) {
        await this.store.updateExam(this.editingExamId()!, {
          date: f.date,
          time: f.time,
          venue: f.venue,
          seats: Number(f.seats) || 40,
          status: (f.status as 'Scheduled' | 'Pending' | 'Completed') || 'Scheduled',
        });
        this.toast.success('Exam updated', f.courseCode);
      } else {
        await this.store.addExam({
          courseCode: f.courseCode,
          courseName: f.courseName || f.courseCode,
          date: f.date,
          time: f.time,
          venue: f.venue,
          seats: Number(f.seats) || 40,
          status: 'Scheduled',
        });
        this.toast.success('Exam scheduled', f.courseCode);
      }
      this.modalOpen.set(false);
      this.editingExamId.set(null);
    } catch {
      this.toast.warning('Could not save exam', 'Use an existing course code from the catalog.');
    }
  }

  setExamField(key: string, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async deleteExam(id: string): Promise<void> {
    try {
      await this.store.deleteExam(id);
      this.toast.info('Exam removed');
    } catch {
      this.toast.warning('Could not remove exam', 'Check API connection and try again.');
    }
  }

  runPayroll(): void {
    this.toast.info(
      'Payroll preview',
      `Demo only — no payroll API yet. ${this.staff().length} staff listed in directory.`
    );
  }
}
