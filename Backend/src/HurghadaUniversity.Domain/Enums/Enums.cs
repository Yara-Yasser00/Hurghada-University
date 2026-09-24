namespace HurghadaUniversity.Domain.Enums;

public enum UserRole
{
    Student = 1,
    Instructor = 2,
    Admin = 3,
    Hr = 4
}

public enum RecordStatus
{
    Active = 1,
    Inactive = 2,
    Review = 3
}

public enum ExamStatus
{
    Scheduled = 1,
    Pending = 2,
    Completed = 3
}

public enum EnrollmentStatus
{
    Registered = 1,
    Dropped = 2,
    Completed = 3
}

public enum FeePaymentStatus
{
    Unpaid = 1,
    Partial = 2,
    Paid = 3
}

public enum ContractType
{
    FullTime = 1,
    PartTime = 2
}

public enum GradePublishStatus
{
    Draft = 1,
    Published = 2
}
