using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Enums;
using HurghadaUniversity.Domain.Exceptions;

namespace HurghadaUniversity.Domain.Entities;

public sealed class Course : AuditableEntity, IAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string ArabicName { get; private set; } = string.Empty;
    public string InstructorName { get; private set; } = string.Empty;
    public Guid? InstructorId { get; private set; }
    public StaffMember? Instructor { get; private set; }
    public string Room { get; private set; } = string.Empty;
    public int Credits { get; private set; }
    public int EnrolledCount { get; private set; }
    public int ProgressPercent { get; private set; }
    public string DepartmentName { get; private set; } = string.Empty;
    public Guid? DepartmentId { get; private set; }
    public bool IsEnabled { get; private set; } = true;
    public string? ScheduleSlot { get; private set; }

    private Course() { }

    public static Course Create(
        string code,
        string name,
        string arabicName,
        string instructorName,
        string room,
        int credits,
        string departmentName,
        string? scheduleSlot = null,
        Guid? instructorId = null,
        Guid? departmentId = null)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
            throw new DomainException("Course.Invalid", "Course code and name are required.");
        if (credits is < 1 or > 6)
            throw new DomainException("Course.Credits", "Credits must be between 1 and 6.");

        return new Course
        {
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            ArabicName = string.IsNullOrWhiteSpace(arabicName) ? name.Trim() : arabicName.Trim(),
            InstructorName = instructorName.Trim(),
            InstructorId = instructorId,
            Room = room.Trim(),
            Credits = credits,
            DepartmentName = departmentName.Trim(),
            DepartmentId = departmentId,
            ScheduleSlot = scheduleSlot
        };
    }

    public void Update(string name, string arabicName, string instructorName, string room, int credits, string departmentName, string? scheduleSlot)
    {
        if (credits is < 1 or > 6)
            throw new DomainException("Course.Credits", "Credits must be between 1 and 6.");

        Name = name.Trim();
        ArabicName = arabicName.Trim();
        InstructorName = instructorName.Trim();
        Room = room.Trim();
        Credits = credits;
        DepartmentName = departmentName.Trim();
        ScheduleSlot = scheduleSlot;
        MarkUpdated();
    }

    public void ToggleEnabled()
    {
        IsEnabled = !IsEnabled;
        MarkUpdated();
    }

    public void SetEnrollmentCount(int count)
    {
        EnrolledCount = Math.Max(0, count);
        MarkUpdated();
    }

    public void SetProgress(int percent)
    {
        ProgressPercent = Math.Clamp(percent, 0, 100);
        MarkUpdated();
    }
}

public sealed class CollegeAdmin : AuditableEntity, IAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public Guid FacultyId { get; private set; }
    public Faculty? Faculty { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public RecordStatus Status { get; private set; } = RecordStatus.Active;

    private CollegeAdmin() { }

    public static CollegeAdmin Create(string code, string fullName, Guid facultyId, string email)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("CollegeAdmin.NameRequired", "Name is required.");

        return new CollegeAdmin
        {
            Code = string.IsNullOrWhiteSpace(code) ? $"CA-{Random.Shared.Next(10, 99)}" : code.Trim(),
            FullName = fullName.Trim(),
            FacultyId = facultyId,
            Email = string.IsNullOrWhiteSpace(email)
                ? $"{fullName.Trim().ToLowerInvariant().Replace(' ', '.')}@hu.edu.eg"
                : email.Trim()
        };
    }

    public void Update(string fullName, Guid facultyId, string email)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("CollegeAdmin.NameRequired", "Name is required.");

        FullName = fullName.Trim();
        FacultyId = facultyId;
        Email = email.Trim();
        MarkUpdated();
    }

    public void ToggleStatus()
    {
        Status = Status == RecordStatus.Active ? RecordStatus.Inactive : RecordStatus.Active;
        MarkUpdated();
    }
}

public sealed class CourseEnrollment : AuditableEntity, IAggregateRoot
{
    public Guid StudentId { get; private set; }
    public Student? Student { get; private set; }
    public Guid CourseId { get; private set; }
    public Course? Course { get; private set; }
    public string Semester { get; private set; } = "Spring 2026";
    public EnrollmentStatus Status { get; private set; } = EnrollmentStatus.Registered;

    private CourseEnrollment() { }

    public static CourseEnrollment Create(Guid studentId, Guid courseId, string semester = "Spring 2026")
        => new()
        {
            StudentId = studentId,
            CourseId = courseId,
            Semester = semester
        };

    public void Drop()
    {
        Status = EnrollmentStatus.Dropped;
        MarkUpdated();
    }
}

public sealed class Exam : AuditableEntity, IAggregateRoot
{
    public Guid CourseId { get; private set; }
    public Course? Course { get; private set; }
    public string CourseCode { get; private set; } = string.Empty;
    public string CourseName { get; private set; } = string.Empty;
    public DateOnly ExamDate { get; private set; }
    public TimeOnly ExamTime { get; private set; }
    public string Venue { get; private set; } = string.Empty;
    public int Seats { get; private set; }
    public ExamStatus Status { get; private set; } = ExamStatus.Scheduled;

    private readonly List<ExamSeat> _seats = [];
    public IReadOnlyCollection<ExamSeat> SeatAssignments => _seats;

    private Exam() { }

    public static Exam Create(Guid courseId, string courseCode, string courseName, DateOnly date, TimeOnly time, string venue, int seats)
    {
        if (seats < 1)
            throw new DomainException("Exam.Seats", "Seats must be at least 1.");

        return new Exam
        {
            CourseId = courseId,
            CourseCode = courseCode.Trim(),
            CourseName = courseName.Trim(),
            ExamDate = date,
            ExamTime = time,
            Venue = venue.Trim(),
            Seats = seats
        };
    }

    public void Update(DateOnly examDate, TimeOnly examTime, string venue, int seats, ExamStatus status)
    {
        if (seats < 1)
            throw new DomainException("Exam.Seats", "Seats must be at least 1.");
        if (seats < _seats.Count)
            throw new DomainException("Exam.Seats", "Cannot reduce seats below assigned count.");

        ExamDate = examDate;
        ExamTime = examTime;
        Venue = venue.Trim();
        Seats = seats;
        Status = status;
        MarkUpdated();
    }

    public void AssignSeat(Guid studentId, string seatNumber)
    {
        if (_seats.Any(s => s.StudentId == studentId))
            throw new DomainException("Exam.DuplicateSeat", "Student already has a seat.");
        if (_seats.Count >= Seats)
            throw new DomainException("Exam.Full", "No remaining seats.");

        _seats.Add(ExamSeat.Create(Id, studentId, seatNumber));
        MarkUpdated();
    }
}

public sealed class ExamSeat : Entity
{
    public Guid ExamId { get; private set; }
    public Guid StudentId { get; private set; }
    public Student? Student { get; private set; }
    public string SeatNumber { get; private set; } = string.Empty;

    private ExamSeat() { }

    public static ExamSeat Create(Guid examId, Guid studentId, string seatNumber)
        => new()
        {
            ExamId = examId,
            StudentId = studentId,
            SeatNumber = seatNumber
        };
}
