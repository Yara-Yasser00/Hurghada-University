using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HurghadaUniversity.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CollegeAdmin> CollegeAdmins => Set<CollegeAdmin>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamSeat> ExamSeats => Set<ExamSeat>();
    public DbSet<GradeEntry> GradeEntries => Set<GradeEntry>();
    public DbSet<AttendanceSession> AttendanceSessions => Set<AttendanceSession>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<RegistrationWindow> RegistrationWindows => Set<RegistrationWindow>();
    public DbSet<FeeAccount> FeeAccounts => Set<FeeAccount>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<SiteProfile> SiteProfiles => Set<SiteProfile>();
    public DbSet<SiteNews> SiteNewsItems => Set<SiteNews>();
    public DbSet<SiteEvent> SiteEvents => Set<SiteEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<Faculty>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Department>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Student>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<StaffMember>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Course>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CollegeAdmin>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CourseEnrollment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Exam>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<GradeEntry>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AttendanceSession>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RegistrationWindow>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<FeeAccount>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Announcement>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<UserAccount>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SiteProfile>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SiteNews>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SiteEvent>().HasQueryFilter(e => !e.IsDeleted);

        modelBuilder.Entity<Faculty>()
            .Navigation(x => x.Departments)
            .HasField("_departments")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.MarkUpdated();
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
