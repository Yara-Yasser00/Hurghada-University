using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Enums;
using HurghadaUniversity.Domain.Exceptions;

namespace HurghadaUniversity.Domain.Entities;

public sealed class GradeEntry : AuditableEntity, IAggregateRoot
{
    public Guid CourseId { get; private set; }
    public Course? Course { get; private set; }
    public Guid StudentId { get; private set; }
    public Student? Student { get; private set; }
    public decimal Midterm { get; private set; }
    public decimal Coursework { get; private set; }
    public decimal Final { get; private set; }
    public GradePublishStatus PublishStatus { get; private set; } = GradePublishStatus.Draft;

    public decimal Total => Midterm + Coursework + Final;
    public string Letter => Total >= 90 ? "A" : Total >= 85 ? "A-" : Total >= 80 ? "B+" : Total >= 75 ? "B" : Total >= 70 ? "C+" : Total >= 65 ? "C" : Total >= 60 ? "D" : "F";

    private GradeEntry() { }

    public static GradeEntry Create(Guid courseId, Guid studentId, decimal midterm, decimal coursework, decimal finalExam)
    {
        ValidateScores(midterm, coursework, finalExam);
        return new GradeEntry
        {
            CourseId = courseId,
            StudentId = studentId,
            Midterm = midterm,
            Coursework = coursework,
            Final = finalExam
        };
    }

    public void UpdateScores(decimal midterm, decimal coursework, decimal finalExam)
    {
        if (PublishStatus == GradePublishStatus.Published)
            throw new DomainException("Grade.Published", "Published grades cannot be edited. Unpublish first.");

        ValidateScores(midterm, coursework, finalExam);
        Midterm = midterm;
        Coursework = coursework;
        Final = finalExam;
        MarkUpdated();
    }

    public void Publish()
    {
        PublishStatus = GradePublishStatus.Published;
        MarkUpdated();
    }

    private static void ValidateScores(decimal midterm, decimal coursework, decimal finalExam)
    {
        if (midterm is < 0 or > 30 || coursework is < 0 or > 20 || finalExam is < 0 or > 50)
            throw new DomainException("Grade.InvalidScores", "Scores exceed allowed maxima (30/20/50).");
    }
}

public sealed class AttendanceSession : AuditableEntity, IAggregateRoot
{
    public Guid CourseId { get; private set; }
    public Course? Course { get; private set; }
    public DateOnly SessionDate { get; private set; }
    public string? Notes { get; private set; }
    public bool IsSubmitted { get; private set; }

    private readonly List<AttendanceRecord> _records = [];
    public IReadOnlyCollection<AttendanceRecord> Records => _records;

    private AttendanceSession() { }

    public static AttendanceSession Create(Guid courseId, DateOnly sessionDate)
        => new()
        {
            CourseId = courseId,
            SessionDate = sessionDate
        };

    public void Mark(Guid studentId, bool isPresent)
    {
        if (IsSubmitted)
            throw new DomainException("Attendance.Submitted", "Session already submitted.");

        var existing = _records.FirstOrDefault(r => r.StudentId == studentId);
        if (existing is null)
            _records.Add(AttendanceRecord.Create(Id, studentId, isPresent));
        else
            existing.SetPresent(isPresent);

        MarkUpdated();
    }

    public void Submit()
    {
        IsSubmitted = true;
        MarkUpdated();
    }
}

public sealed class AttendanceRecord : Entity
{
    public Guid SessionId { get; private set; }
    public Guid StudentId { get; private set; }
    public Student? Student { get; private set; }
    public bool IsPresent { get; private set; }

    private AttendanceRecord() { }

    public static AttendanceRecord Create(Guid sessionId, Guid studentId, bool isPresent)
        => new()
        {
            SessionId = sessionId,
            StudentId = studentId,
            IsPresent = isPresent
        };

    public void SetPresent(bool isPresent) => IsPresent = isPresent;
}

public sealed class RegistrationWindow : AuditableEntity, IAggregateRoot
{
    public string Semester { get; private set; } = "Spring 2026";
    public bool IsOpen { get; private set; } = true;
    public DateOnly ClosesOn { get; private set; }
    public int CreditLimit { get; private set; } = 18;

    private RegistrationWindow() { }

    public static RegistrationWindow Create(string semester, DateOnly closesOn, int creditLimit = 18)
        => new()
        {
            Semester = semester,
            ClosesOn = closesOn,
            CreditLimit = creditLimit,
            IsOpen = true
        };

    public void SetOpen(bool open)
    {
        IsOpen = open;
        MarkUpdated();
    }
}

public sealed class FeeAccount : AuditableEntity, IAggregateRoot
{
    public Guid StudentId { get; private set; }
    public Student? Student { get; private set; }
    public string Semester { get; private set; } = "Spring 2026";
    public decimal TuitionAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public DateOnly DueDate { get; private set; }

    public decimal Balance => Math.Max(0, TuitionAmount - PaidAmount);
    public FeePaymentStatus Status =>
        PaidAmount <= 0 ? FeePaymentStatus.Unpaid :
        PaidAmount >= TuitionAmount ? FeePaymentStatus.Paid :
        FeePaymentStatus.Partial;

    private FeeAccount() { }

    public static FeeAccount Create(Guid studentId, string semester, decimal tuition, decimal paid, DateOnly dueDate)
        => new()
        {
            StudentId = studentId,
            Semester = semester,
            TuitionAmount = tuition,
            PaidAmount = paid,
            DueDate = dueDate
        };

    public void RecordPayment(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Fee.InvalidPayment", "Payment must be positive.");
        PaidAmount += amount;
        MarkUpdated();
    }
}

public sealed class Announcement : AuditableEntity, IAggregateRoot
{
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string Audience { get; private set; } = "University";
    public DateOnly PublishedOn { get; private set; }

    private Announcement() { }

    public static Announcement Create(string title, string body, string audience, DateOnly publishedOn)
        => new()
        {
            Title = title.Trim(),
            Body = body.Trim(),
            Audience = audience.Trim(),
            PublishedOn = publishedOn
        };

    public void Update(string title, string body, string audience, DateOnly publishedOn)
    {
        Title = title.Trim();
        Body = body.Trim();
        Audience = audience.Trim();
        PublishedOn = publishedOn;
        MarkUpdated();
    }
}

public sealed class Notification : AuditableEntity, IAggregateRoot
{
    public Guid? UserAccountId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? Href { get; private set; }
    public bool IsRead { get; private set; }

    private Notification() { }

    public static Notification Create(string title, string body, string? href = null, Guid? userAccountId = null)
        => new()
        {
            Title = title.Trim(),
            Body = body.Trim(),
            Href = href,
            UserAccountId = userAccountId
        };

    public void MarkRead()
    {
        IsRead = true;
        MarkUpdated();
    }
}

public sealed class UserAccount : AuditableEntity, IAggregateRoot
{
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;

    private UserAccount() { }

    public static UserAccount Create(string username, string passwordHash, string displayName, UserRole role)
        => new()
        {
            Username = username.Trim(),
            PasswordHash = passwordHash,
            DisplayName = displayName.Trim(),
            Role = role
        };

    public void Deactivate()
    {
        IsActive = false;
        MarkUpdated();
    }
}
