import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'academic',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'academic' },
  },
  {
    path: 'academic/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'academic' },
  },
  {
    path: 'faculties',
    loadComponent: () => import('./pages/colleges/colleges-page.component').then((m) => m.CollegesPageComponent),
  },
  {
    path: 'faculties/:id',
    loadComponent: () => import('./pages/faculty/faculty-page.component').then((m) => m.FacultyPageComponent),
  },
  {
    path: 'research',
    loadComponent: () => import('./pages/research/research-page.component').then((m) => m.ResearchPageComponent),
  },
  {
    path: 'research/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'research' },
  },
  {
    path: 'community',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'community' },
  },
  {
    path: 'community/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'community' },
  },
  {
    path: 'students',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'students' },
  },
  {
    path: 'students/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'students' },
  },
  {
    path: 'staff',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'staff' },
  },
  {
    path: 'staff/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'staff' },
  },
  {
    path: 'visitors',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'visitors' },
  },
  {
    path: 'visitors/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'visitors' },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about-page.component').then((m) => m.AboutPageComponent),
  },
  {
    path: 'about/:slug',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'about' },
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./pages/portal/portal-gateway-page.component').then((m) => m.PortalGatewayPageComponent),
  },
  {
    path: 'e-services',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
  {
    path: 'ai',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'ai' },
  },
  {
    path: 'national',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'national' },
  },
  {
    path: 'international',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
    data: { sectionId: 'international' },
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news-page.component').then((m) => m.NewsPageComponent),
  },
  {
    path: 'news/:id',
    loadComponent: () =>
      import('./pages/news/news-article-page.component').then((m) => m.NewsArticlePageComponent),
  },
  {
    path: 'agenda',
    loadComponent: () => import('./pages/events/events-page.component').then((m) => m.EventsPageComponent),
  },
  {
    path: 'events',
    redirectTo: 'agenda',
    pathMatch: 'full',
  },
  {
    path: 'links',
    loadComponent: () => import('./pages/links/links-page.component').then((m) => m.LinksPageComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact-page.component').then((m) => m.ContactPageComponent),
  },
  {
    path: 'admissions',
    loadComponent: () =>
      import('./pages/admissions/admissions-page.component').then((m) => m.AdmissionsPageComponent),
  },
  { path: 'study', redirectTo: 'academic', pathMatch: 'full' },
  { path: 'colleges', redirectTo: 'faculties', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found-page.component').then((m) => m.NotFoundPageComponent),
  },
];