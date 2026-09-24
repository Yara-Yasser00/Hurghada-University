using HurghadaUniversity.Domain.Enums;

namespace HurghadaUniversity.Application.Common.Models;

public sealed record StudentDto(
    Guid Id,
    string UniversityId,
    string FullName,
    Guid FacultyId,
    string FacultyName,
    string Level,
    decimal Gpa,
    string Status);

public sealed record StaffDto(
    Guid Id,
    string StaffCode,
    string FullName,
    string RoleTitle,
    string DepartmentName,
    string Contract,
    int SinceYear);

public sealed record FacultyDto(
    Guid Id,
    string Name,
    string ArabicName,
    string Dean,
    int DepartmentCount,
    int StudentCount,
    string Status,
    bool IsEnabled,
    string Description,
    string ImageUrl,
    string Slug);

public sealed record DepartmentDto(
    Guid Id,
    string Code,
    string Name,
    Guid FacultyId,
    string FacultyName,
    string Head,
    int Programs,
    string Status);

public sealed record CourseDto(
    Guid Id,
    string Code,
    string Name,
    string ArabicName,
    string InstructorName,
    string Room,
    int Credits,
    int EnrolledCount,
    int ProgressPercent,
    string DepartmentName,
    bool IsEnabled,
    string? ScheduleSlot);

public sealed record CollegeAdminDto(Guid Id, string Code, string FullName, Guid FacultyId, string FacultyName, string Email, string Status);

public sealed record ExamDto(
    Guid Id,
    Guid CourseId,
    string CourseCode,
    string CourseName,
    DateOnly ExamDate,
    TimeOnly ExamTime,
    string Venue,
    int Seats,
    string Status);

public sealed record ExamSeatDto(Guid StudentId, string StudentName, string UniversityId, string SeatNumber);

public sealed record AnnouncementDto(Guid Id, string Title, string Body, string Audience, DateOnly PublishedOn);

public sealed record NotificationDto(Guid Id, string Title, string Body, string? Href, bool IsRead, DateTime CreatedAtUtc);

public sealed record FeeAccountDto(
    Guid Id,
    Guid StudentId,
    string Semester,
    decimal TuitionAmount,
    decimal PaidAmount,
    decimal Balance,
    DateOnly DueDate,
    string Status);

public sealed record GradeDto(
    Guid Id,
    Guid CourseId,
    string CourseCode,
    Guid StudentId,
    string StudentName,
    decimal Midterm,
    decimal Coursework,
    decimal Final,
    decimal Total,
    string Letter,
    string PublishStatus);

public sealed record AuthResponse(
    string AccessToken,
    Guid UserId,
    string Username,
    string DisplayName,
    UserRole Role);

public sealed record DashboardStatsDto(
    int TotalStudents,
    int TotalStaff,
    int ActiveCourses,
    int Faculties,
    decimal EnrollmentRate);
