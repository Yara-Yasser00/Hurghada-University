import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import {
  AdminDashboardComponent,
  HrDashboardComponent,
  InstructorDashboardComponent,
  StudentDashboardComponent,
} from './pages/dashboards/dashboards';
import {
  AttendancePageComponent,
  CoursesPageComponent,
  GradesPageComponent,
  OperationsPageComponent,
  SchedulePageComponent,
} from './pages/portal/portal-pages';
import { DirectoryPageComponent } from './pages/portal/directory-page.component';
import {
  AnnouncementsPageComponent,
  FeesPageComponent,
  NotFoundPageComponent,
  NotificationsPageComponent,
  ProfilePageComponent,
  SettingsPageComponent,
} from './pages/system/system-pages';
import { CmsPageComponent } from './pages/system/cms-page.component';

const sharedChildren = [
  { path: 'settings', component: SettingsPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'notifications', component: NotificationsPageComponent },
  { path: 'announcements', component: AnnouncementsPageComponent },
];

export const routes: Routes = [
  // Public marketing site is served at `/` by the API; this app is the `/app` dashboard SPA.
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'student',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'student' },
    children: [
      { path: '', component: StudentDashboardComponent },
      { path: 'courses', component: CoursesPageComponent, data: { role: 'student' } },
      { path: 'schedule', component: SchedulePageComponent },
      { path: 'grades', component: GradesPageComponent, data: { instructor: false } },
      { path: 'absences', component: AttendancePageComponent, data: { instructor: false } },
      { path: 'fees', component: FeesPageComponent },
      ...sharedChildren,
    ],
  },
  {
    path: 'instructor',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'instructor' },
    children: [
      { path: '', component: InstructorDashboardComponent },
      { path: 'courses', component: CoursesPageComponent, data: { role: 'instructor' } },
      { path: 'grades', component: GradesPageComponent, data: { instructor: true } },
      { path: 'schedule', component: SchedulePageComponent },
      { path: 'absences', component: AttendancePageComponent, data: { instructor: true } },
      ...sharedChildren,
    ],
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'faculties', component: DirectoryPageComponent, data: { type: 'faculties' } },
      { path: 'departments', component: DirectoryPageComponent, data: { type: 'departments' } },
      { path: 'college-admins', component: DirectoryPageComponent, data: { type: 'admins' } },
      { path: 'students', component: DirectoryPageComponent, data: { type: 'students' } },
      { path: 'courses', component: CoursesPageComponent, data: { role: 'admin' } },
      { path: 'exams', component: OperationsPageComponent, data: { type: 'exams' } },
      { path: 'registration', component: OperationsPageComponent, data: { type: 'registration' } },
      { path: 'cms', component: CmsPageComponent },
      ...sharedChildren,
    ],
  },
  {
    path: 'hr',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'hr' },
    children: [
      { path: '', component: HrDashboardComponent },
      { path: 'staff', component: DirectoryPageComponent, data: { type: 'staff' } },
      { path: 'payroll', component: OperationsPageComponent, data: { type: 'payroll' } },
      ...sharedChildren,
    ],
  },
  { path: '**', component: NotFoundPageComponent },
];
