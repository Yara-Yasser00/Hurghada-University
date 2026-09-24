using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Enums;
using HurghadaUniversity.Domain.Exceptions;

namespace HurghadaUniversity.Domain.Entities;

public sealed class Faculty : AuditableEntity, IAggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public string ArabicName { get; private set; } = string.Empty;
    public string Dean { get; private set; } = string.Empty;
    public int DepartmentCount { get; private set; }
    public int StudentCount { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public bool IsEnabled { get; private set; } = true;
    public string Description { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = "/assets/campus/study.png";
    public string Slug { get; private set; } = string.Empty;

    private readonly List<Department> _departments = [];
    public IReadOnlyCollection<Department> Departments => _departments;

    private Faculty() { }

    public static Faculty Create(
        string name,
        string arabicName,
        string dean,
        int departmentCount = 0,
        int studentCount = 0,
        string? description = null,
        string? imageUrl = null,
        string? slug = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Faculty.NameRequired", "Faculty name is required.");

        var trimmedName = name.Trim();
        return new Faculty
        {
            Name = trimmedName,
            ArabicName = string.IsNullOrWhiteSpace(arabicName) ? trimmedName : arabicName.Trim(),
            Dean = string.IsNullOrWhiteSpace(dean) ? "TBD" : dean.Trim(),
            DepartmentCount = Math.Max(0, departmentCount),
            StudentCount = Math.Max(0, studentCount),
            Description = description?.Trim() ?? string.Empty,
            ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? "/assets/campus/study.png" : imageUrl.Trim(),
            Slug = NormalizeSlug(slug, trimmedName)
        };
    }

    public void Update(
        string name,
        string arabicName,
        string dean,
        int departmentCount,
        int studentCount,
        string? description = null,
        string? imageUrl = null,
        string? slug = null)
    {
        Name = name.Trim();
        ArabicName = arabicName.Trim();
        Dean = dean.Trim();
        DepartmentCount = Math.Max(0, departmentCount);
        StudentCount = Math.Max(0, studentCount);
        if (description is not null) Description = description.Trim();
        if (imageUrl is not null && !string.IsNullOrWhiteSpace(imageUrl)) ImageUrl = imageUrl.Trim();
        if (slug is not null) Slug = NormalizeSlug(slug, Name);
        MarkUpdated();
    }

    private static string NormalizeSlug(string? slug, string fallbackName)
    {
        var source = string.IsNullOrWhiteSpace(slug) ? fallbackName : slug;
        var chars = source.Trim().ToLowerInvariant()
            .Select(c => char.IsLetterOrDigit(c) ? c : '-')
            .ToArray();
        var normalized = new string(chars);
        while (normalized.Contains("--", StringComparison.Ordinal))
            normalized = normalized.Replace("--", "-", StringComparison.Ordinal);
        return normalized.Trim('-');
    }

    public void ToggleEnabled()
    {
        IsEnabled = !IsEnabled;
        Status = IsEnabled ? RecordStatus.Active : RecordStatus.Inactive;
        MarkUpdated();
    }
}

public sealed class Department : AuditableEntity, IAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public Guid FacultyId { get; private set; }
    public Faculty? Faculty { get; private set; }
    public string Head { get; private set; } = string.Empty;
    public int Programs { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;

    private Department() { }

    public static Department Create(string code, string name, Guid facultyId, string head, int programs)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Department.NameRequired", "Department name is required.");

        return new Department
        {
            Code = string.IsNullOrWhiteSpace(code) ? $"D-{Random.Shared.Next(10, 99)}" : code.Trim(),
            Name = name.Trim(),
            FacultyId = facultyId,
            Head = string.IsNullOrWhiteSpace(head) ? "TBD" : head.Trim(),
            Programs = Math.Max(1, programs)
        };
    }

    public void Update(string name, string head, int programs, RecordStatus status)
    {
        Name = name.Trim();
        Head = head.Trim();
        Programs = Math.Max(1, programs);
        Status = status;
        MarkUpdated();
    }
}

public sealed class Student : AuditableEntity, IAggregateRoot
{
    public string UniversityId { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public Guid FacultyId { get; private set; }
    public Faculty? Faculty { get; private set; }
    public string Level { get; private set; } = "First";
    public decimal Gpa { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public Guid? UserAccountId { get; private set; }

    private Student() { }

    public static Student Create(string universityId, string fullName, Guid facultyId, string level, decimal gpa, RecordStatus status = RecordStatus.Active)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("Student.NameRequired", "Student name is required.");
        if (gpa is < 0 or > 4)
            throw new DomainException("Student.InvalidGpa", "GPA must be between 0 and 4.");

        return new Student
        {
            UniversityId = string.IsNullOrWhiteSpace(universityId)
                ? $"2026{Random.Shared.Next(1000, 9999)}"
                : universityId.Trim(),
            FullName = fullName.Trim(),
            FacultyId = facultyId,
            Level = string.IsNullOrWhiteSpace(level) ? "First" : level.Trim(),
            Gpa = gpa,
            Status = status
        };
    }

    public void Update(string fullName, Guid facultyId, string level, decimal gpa, RecordStatus status)
    {
        if (gpa is < 0 or > 4)
            throw new DomainException("Student.InvalidGpa", "GPA must be between 0 and 4.");

        FullName = fullName.Trim();
        FacultyId = facultyId;
        Level = level.Trim();
        Gpa = gpa;
        Status = status;
        MarkUpdated();
    }

    public void LinkUser(Guid userAccountId) => UserAccountId = userAccountId;
}

public sealed class StaffMember : AuditableEntity, IAggregateRoot
{
    public string StaffCode { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string RoleTitle { get; private set; } = string.Empty;
    public Guid? DepartmentId { get; private set; }
    public Department? Department { get; private set; }
    public string DepartmentName { get; private set; } = string.Empty;
    public ContractType Contract { get; private set; } = ContractType.FullTime;
    public int SinceYear { get; private set; }
    public Guid? UserAccountId { get; private set; }

    private StaffMember() { }

    public static StaffMember Create(string staffCode, string fullName, string roleTitle, string departmentName, ContractType contract, int sinceYear, Guid? departmentId = null)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("Staff.NameRequired", "Staff name is required.");

        return new StaffMember
        {
            StaffCode = string.IsNullOrWhiteSpace(staffCode) ? $"HU-{Random.Shared.Next(1000, 9999)}" : staffCode.Trim(),
            FullName = fullName.Trim(),
            RoleTitle = roleTitle.Trim(),
            DepartmentName = departmentName.Trim(),
            DepartmentId = departmentId,
            Contract = contract,
            SinceYear = sinceYear
        };
    }

    public void Update(string fullName, string roleTitle, string departmentName, ContractType contract, int sinceYear)
    {
        FullName = fullName.Trim();
        RoleTitle = roleTitle.Trim();
        DepartmentName = departmentName.Trim();
        Contract = contract;
        SinceYear = sinceYear;
        MarkUpdated();
    }

    public void LinkUser(Guid userAccountId) => UserAccountId = userAccountId;
}
