using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HurghadaUniversity.Infrastructure.Persistence.Repositories;

public class Repository<T>(AppDbContext db) : IRepository<T> where T : Entity
{
    protected readonly AppDbContext Db = db;
    protected readonly DbSet<T> Set = db.Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await Set.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public virtual async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default)
        => await Set.AsNoTracking().ToListAsync(cancellationToken);

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
        => await Set.AddAsync(entity, cancellationToken);

    public virtual void Update(T entity) => Set.Update(entity);

    public virtual void Remove(T entity)
    {
        if (entity is AuditableEntity auditable)
        {
            auditable.SoftDelete();
            Set.Update(entity);
        }
        else
        {
            Set.Remove(entity);
        }
    }
}

public sealed class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}

public sealed class StudentRepository(AppDbContext db) : Repository<Student>(db), IStudentRepository
{
    public override async Task<Student?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Student?> GetByUniversityIdAsync(string universityId, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty)
            .FirstOrDefaultAsync(x => x.UniversityId == universityId, cancellationToken);

    public async Task<IReadOnlyList<Student>> SearchAsync(string? query, CancellationToken cancellationToken = default)
    {
        var q = Set.Include(x => x.Faculty).AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            q = q.Where(x =>
                x.FullName.ToLower().Contains(term) ||
                x.UniversityId.ToLower().Contains(term) ||
                (x.Faculty != null && x.Faculty.Name.ToLower().Contains(term)));
        }

        return await q.OrderBy(x => x.FullName).ToListAsync(cancellationToken);
    }

    public override async Task<IReadOnlyList<Student>> ListAsync(CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty).AsNoTracking().ToListAsync(cancellationToken);
}

public sealed class StaffRepository(AppDbContext db) : Repository<StaffMember>(db), IStaffRepository
{
    public async Task<IReadOnlyList<StaffMember>> SearchAsync(string? query, CancellationToken cancellationToken = default)
    {
        var q = Set.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            q = q.Where(x =>
                x.FullName.ToLower().Contains(term) ||
                x.StaffCode.ToLower().Contains(term) ||
                x.DepartmentName.ToLower().Contains(term));
        }

        return await q.OrderBy(x => x.FullName).ToListAsync(cancellationToken);
    }
}

public sealed class FacultyRepository(AppDbContext db) : Repository<Faculty>(db), IFacultyRepository
{
    public Task<Faculty?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
}

public sealed class DepartmentRepository(AppDbContext db) : Repository<Department>(db), IDepartmentRepository
{
    public override async Task<IReadOnlyList<Department>> ListAsync(CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty).AsNoTracking().ToListAsync(cancellationToken);
}

public sealed class CourseRepository(AppDbContext db) : Repository<Course>(db), ICourseRepository
{
    public Task<Course?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(x => x.Code == code.ToUpper(), cancellationToken);

    public async Task<IReadOnlyList<Course>> SearchAsync(string? query, CancellationToken cancellationToken = default)
    {
        var q = Set.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            q = q.Where(x => x.Code.ToLower().Contains(term) || x.Name.ToLower().Contains(term));
        }

        return await q.OrderBy(x => x.Code).ToListAsync(cancellationToken);
    }
}

public sealed class CollegeAdminRepository(AppDbContext db) : Repository<CollegeAdmin>(db), ICollegeAdminRepository
{
    public override async Task<IReadOnlyList<CollegeAdmin>> ListAsync(CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty).AsNoTracking().ToListAsync(cancellationToken);

    public override async Task<CollegeAdmin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Faculty).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
}

public sealed class ExamRepository(AppDbContext db) : Repository<Exam>(db), IExamRepository
{
    public async Task<Exam?> GetWithSeatsAsync(Guid id, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.SeatAssignments).ThenInclude(s => s.Student)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
}

public sealed class EnrollmentRepository(AppDbContext db) : Repository<CourseEnrollment>(db), IEnrollmentRepository
{
    public async Task<IReadOnlyList<CourseEnrollment>> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default)
        => await Set.Where(x => x.StudentId == studentId).ToListAsync(cancellationToken);

    public Task<bool> ExistsAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default)
        => Set.AnyAsync(x =>
            x.StudentId == studentId &&
            x.CourseId == courseId &&
            x.Status == Domain.Enums.EnrollmentStatus.Registered, cancellationToken);
}

public sealed class GradeRepository(AppDbContext db) : Repository<GradeEntry>(db), IGradeRepository
{
    public async Task<IReadOnlyList<GradeEntry>> GetByCourseAsync(Guid courseId, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Student).Where(x => x.CourseId == courseId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<GradeEntry>> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Course).Where(x => x.StudentId == studentId).ToListAsync(cancellationToken);
}

public sealed class AttendanceRepository(AppDbContext db) : Repository<AttendanceSession>(db), IAttendanceRepository
{
    public async Task<AttendanceSession?> GetWithRecordsAsync(Guid id, CancellationToken cancellationToken = default)
        => await Set.Include(x => x.Records).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
}

public sealed class RegistrationWindowRepository(AppDbContext db) : Repository<RegistrationWindow>(db), IRegistrationWindowRepository
{
    public Task<RegistrationWindow?> GetCurrentAsync(CancellationToken cancellationToken = default)
        => Set.OrderByDescending(x => x.CreatedAtUtc).FirstOrDefaultAsync(cancellationToken);
}

public sealed class FeeAccountRepository(AppDbContext db) : Repository<FeeAccount>(db), IFeeAccountRepository
{
    public Task<FeeAccount?> GetByStudentAsync(Guid studentId, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(x => x.StudentId == studentId, cancellationToken);
}

public sealed class AnnouncementRepository(AppDbContext db) : Repository<Announcement>(db), IAnnouncementRepository;

public sealed class NotificationRepository(AppDbContext db) : Repository<Notification>(db), INotificationRepository
{
    public async Task<IReadOnlyList<Notification>> GetForUserAsync(Guid? userId, CancellationToken cancellationToken = default)
    {
        var q = Set.AsNoTracking().AsQueryable();
        q = userId is null
            ? q.Where(x => x.UserAccountId == null)
            : q.Where(x => x.UserAccountId == null || x.UserAccountId == userId);

        return await q.OrderByDescending(x => x.CreatedAtUtc).ToListAsync(cancellationToken);
    }
}

public sealed class UserAccountRepository(AppDbContext db) : Repository<UserAccount>(db), IUserAccountRepository
{
    public Task<UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(x => x.Username == username, cancellationToken);
}

public sealed class SiteProfileRepository(AppDbContext db) : Repository<SiteProfile>(db), ISiteProfileRepository
{
    public Task<SiteProfile?> GetAsync(CancellationToken cancellationToken = default)
        => Set.OrderBy(x => x.CreatedAtUtc).FirstOrDefaultAsync(cancellationToken);
}

public sealed class SiteNewsRepository(AppDbContext db) : Repository<SiteNews>(db), ISiteNewsRepository;

public sealed class SiteEventRepository(AppDbContext db) : Repository<SiteEvent>(db), ISiteEventRepository;
