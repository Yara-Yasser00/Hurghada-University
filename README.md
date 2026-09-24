# Hurghada University Management System

Full-stack university portal: public admissions site + role-based portals (Student, Instructor, Admin, HR).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 19 (standalone), `http://localhost:4200` |
| Backend | ASP.NET Core 10 Clean Architecture + MediatR CQRS |
| Database | SQL Server (configured in Development settings) |

## Quick start

### 1. API

```bash
cd Backend
dotnet restore
dotnet run --project src/HurghadaUniversity.API --launch-profile http
```

- API: http://localhost:5142  
- Swagger: http://localhost:5142/swagger  
- Health: http://localhost:5142/health  

Development connection string and JWT key live in  
`Backend/src/HurghadaUniversity.API/appsettings.Development.json`.

For production, set environment variables (do **not** commit secrets):

```bash
ConnectionStrings__DefaultConnection=...
Jwt__Key=...at-least-32-chars...
Cors__Origins__0=https://your-frontend-host
```

### 2. Frontend

```bash
cd Frontend
npm install
npm start
```

Open http://localhost:4200  

Production build:

```bash
npm run build:prod
```

Set `apiUrl` in `Frontend/src/environments/environment.prod.ts` before deploying.

## Demo logins

Password for all accounts: `hurghada`

| Username | Role |
|----------|------|
| `2024010001` | Student |
| `HU-1028` | Instructor |
| `HU-ADMIN` | Admin |
| `HU-HR01` | HR |

## What is wired to the API

- Auth (JWT)
- Public site data
- Directory CRUD (students, staff, faculties, departments, college admins)
- Courses CRUD + student register/drop + enrollments
- Exams CRUD + seat listing
- Registration window open/close
- Announcements
- Notifications
- Fees (get / pay)
- Admin dashboard stats
- Grades (load / upsert / publish)

## Project layout

```
Hurghada University/
├── Backend/          # .NET solution
├── Frontend/         # Angular app
└── README.md         # this file
```
