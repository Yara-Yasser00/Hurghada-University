# Hurghada University — Frontend

Angular 19 portal matching the Figma Make **User dashboard** prototype, with full business coverage for Student / Faculty / Admin / HR.

## Run locally

```bash
cd Frontend
npm install
npm start
```

Open **http://localhost:4200/** → choose a role → sign in.

## What’s included

| Area | Coverage |
|------|----------|
| Auth | Role login, session, route guards, sign out |
| Student | Dashboard, registration + conflict/credit checks, schedule, grades, attendance, fees, announcements |
| Instructor | Dashboard, courses + roster, grade save/publish, attendance with date, schedule |
| Admin | KPIs, faculties/departments/admins/students CRUD drawers, course catalog, exams + seating, registration toggle |
| HR | Dashboard, staff directory CRUD, payroll |
| Shared | Notifications, settings (EN/AR), profile, toasts, 404 |

## Useful URLs (after login)

- `/admin/students` — student records + view/edit
- `/student/courses` — registration with conflict detection
- `/instructor/grades` — grade entry + publish
- `/admin/exams` — exam schedule + seating
- `/{role}/settings` · `/{role}/notifications` · `/{role}/profile`
