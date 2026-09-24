# Hurghada University — Backend API

ASP.NET Core **.NET 10** Web API using **Clean Architecture**, **SOLID**, CQRS (MediatR), Repository + Unit of Work, and Result pattern.

## Run (Development)

```bash
cd Backend
dotnet restore
dotnet run --project src/HurghadaUniversity.API --launch-profile http
```

- API: `http://localhost:5142`
- Swagger: `http://localhost:5142/swagger`
- Health: `http://localhost:5142/health`

SQL Server connection + JWT are read from `appsettings.Development.json` locally.
Production must supply `ConnectionStrings__DefaultConnection`, `Jwt__Key`, and `Cors__Origins` via environment variables.

## Demo accounts

Password for all: `hurghada`

| Username | Role |
|----------|------|
| `2024010001` | Student |
| `HU-1028` | Instructor |
| `HU-ADMIN` | Admin |
| `HU-HR01` | HR |

## Main endpoints

| Area | Route prefix |
|------|----------------|
| Auth | `/api/auth` |
| Students / Staff / Faculties / Departments / Courses / CollegeAdmins | `/api/{controller}` |
| Exams / Registration / Grades / Attendance | `/api/{controller}` |
| Announcements / Notifications / Fees / Dashboards | `/api/{controller}` |
| Health | `/health` |
