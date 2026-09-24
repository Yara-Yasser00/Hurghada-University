using HurghadaUniversity.Domain.Common;

namespace HurghadaUniversity.Application.Abstractions.Persistence;

public interface IRepository<T> where T : Entity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Remove(T entity);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IStudentRepository : IRepository<Domain.Entities.Student>
{
    Task<Domain.Entities.Student?> GetByUniversityIdAsync(string universityId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Domain.Entities.Student>> SearchAsync(string? query, CancellationToken cancellationToken = default);
}

public interface IStaffRepository : IRepository<Domain.Entities.StaffMember>
{
    Task<IReadOnlyList<Domain.Entities.StaffMember>> SearchAsync(string? query, CancellationToken cancellationToken = default);
}

public interface IFacultyRepository : IRepository<Domain.Entities.Faculty>
{
    Task<Domain.Entities.Faculty?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}

public interface IDepartmentRepository : IRepository<Domain.Entities.Department>;
public interface ICourseRepository : IRepository<Domain.Entities.Course>
{
    Task<Domain.Entities.Course?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Domain.Entities.Course>> SearchAsync(string? query, CancellationToken cancellationToken = default);
}

public interface ICollegeAdminRepository : IRepository<Domain.Entities.CollegeAdmin>;
public interface IExamRepository : IRepository<Domain.Entities.Exam>
{
    Task<Domain.Entities.Exam?> GetWithSeatsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IEnrollmentRepository : IRepository<Domain.Entities.CourseEnrollment>
{
    Task<IReadOnlyList<Domain.Entities.CourseEnrollment>> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default);
}

public interface IGradeRepository : IRepository<Domain.Entities.GradeEntry>
{
    Task<IReadOnlyList<Domain.Entities.GradeEntry>> GetByCourseAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Domain.Entities.GradeEntry>> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default);
}

public interface IAttendanceRepository : IRepository<Domain.Entities.AttendanceSession>
{
    Task<Domain.Entities.AttendanceSession?> GetWithRecordsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IRegistrationWindowRepository : IRepository<Domain.Entities.RegistrationWindow>
{
    Task<Domain.Entities.RegistrationWindow?> GetCurrentAsync(CancellationToken cancellationToken = default);
}

public interface IFeeAccountRepository : IRepository<Domain.Entities.FeeAccount>
{
    Task<Domain.Entities.FeeAccount?> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default);
}

public interface IAnnouncementRepository : IRepository<Domain.Entities.Announcement>;
public interface INotificationRepository : IRepository<Domain.Entities.Notification>
{
    Task<IReadOnlyList<Domain.Entities.Notification>> GetForUserAsync(Guid? userId, CancellationToken cancellationToken = default);
}

public interface IUserAccountRepository : IRepository<Domain.Entities.UserAccount>
{
    Task<Domain.Entities.UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
}

public interface ISiteProfileRepository : IRepository<Domain.Entities.SiteProfile>
{
    Task<Domain.Entities.SiteProfile?> GetAsync(CancellationToken cancellationToken = default);
}

public interface ISiteNewsRepository : IRepository<Domain.Entities.SiteNews>;
public interface ISiteEventRepository : IRepository<Domain.Entities.SiteEvent>;
