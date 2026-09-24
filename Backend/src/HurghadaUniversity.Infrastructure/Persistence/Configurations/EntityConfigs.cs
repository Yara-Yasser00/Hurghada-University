using HurghadaUniversity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HurghadaUniversity.Infrastructure.Persistence.Configurations;

public sealed class FacultyConfig : IEntityTypeConfiguration<Faculty>
{
    public void Configure(EntityTypeBuilder<Faculty> builder)
    {
        builder.ToTable("Faculties");
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.ArabicName).HasMaxLength(200);
        builder.Property(x => x.Dean).HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.ImageUrl).HasMaxLength(500);
        builder.Property(x => x.Slug).HasMaxLength(100);
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.Slug);
    }
}

public sealed class SiteProfileConfig : IEntityTypeConfiguration<SiteProfile>
{
    public void Configure(EntityTypeBuilder<SiteProfile> builder)
    {
        builder.ToTable("SiteProfiles");
        builder.Property(x => x.BrandNameAr).HasMaxLength(200);
        builder.Property(x => x.BrandNameEn).HasMaxLength(200);
        builder.Property(x => x.Tagline).HasMaxLength(500);
        builder.Property(x => x.TaglineEn).HasMaxLength(500);
        builder.Property(x => x.AboutIntro).HasMaxLength(4000);
        builder.Property(x => x.AboutIntroEn).HasMaxLength(4000);
        builder.Property(x => x.AddressLines).HasMaxLength(1000);
        builder.Property(x => x.AddressLinesEn).HasMaxLength(1000);
        builder.Property(x => x.Phone).HasMaxLength(50);
        builder.Property(x => x.Email).HasMaxLength(200);
        builder.Property(x => x.Website).HasMaxLength(300);
        builder.Property(x => x.HeroImageUrl).HasMaxLength(500);
        builder.Property(x => x.GlobalImageUrl).HasMaxLength(500);
        builder.Property(x => x.PresidentName).HasMaxLength(200);
        builder.Property(x => x.PresidentTitle).HasMaxLength(200);
        builder.Property(x => x.PresidentTitleEn).HasMaxLength(200);
    }
}

public sealed class SiteNewsConfig : IEntityTypeConfiguration<SiteNews>
{
    public void Configure(EntityTypeBuilder<SiteNews> builder)
    {
        builder.ToTable("SiteNewsItems");
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.CategoryEn).HasMaxLength(100);
        builder.Property(x => x.Title).HasMaxLength(400).IsRequired();
        builder.Property(x => x.TitleEn).HasMaxLength(400);
        builder.Property(x => x.Summary).HasMaxLength(2000);
        builder.Property(x => x.SummaryEn).HasMaxLength(2000);
        builder.Property(x => x.ImageUrl).HasMaxLength(500);
        builder.Property(x => x.PublishedLabel).HasMaxLength(50);
    }
}

public sealed class SiteEventConfig : IEntityTypeConfiguration<SiteEvent>
{
    public void Configure(EntityTypeBuilder<SiteEvent> builder)
    {
        builder.ToTable("SiteEvents");
        builder.Property(x => x.Day).HasMaxLength(10);
        builder.Property(x => x.Month).HasMaxLength(20);
        builder.Property(x => x.MonthEn).HasMaxLength(20);
        builder.Property(x => x.Title).HasMaxLength(400).IsRequired();
        builder.Property(x => x.TitleEn).HasMaxLength(400);
        builder.Property(x => x.Location).HasMaxLength(300);
        builder.Property(x => x.LocationEn).HasMaxLength(300);
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.CategoryEn).HasMaxLength(100);
    }
}

public sealed class DepartmentConfig : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");
        builder.Property(x => x.Code).HasMaxLength(20);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.HasOne(x => x.Faculty).WithMany(x => x.Departments).HasForeignKey(x => x.FacultyId);
    }
}

public sealed class StudentConfig : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");
        builder.Property(x => x.UniversityId).HasMaxLength(30).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Level).HasMaxLength(50);
        builder.Property(x => x.Gpa).HasPrecision(3, 2);
        builder.HasIndex(x => x.UniversityId).IsUnique();
        builder.HasOne(x => x.Faculty).WithMany().HasForeignKey(x => x.FacultyId);
    }
}

public sealed class StaffConfig : IEntityTypeConfiguration<StaffMember>
{
    public void Configure(EntityTypeBuilder<StaffMember> builder)
    {
        builder.ToTable("StaffMembers");
        builder.Property(x => x.StaffCode).HasMaxLength(30).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => x.StaffCode).IsUnique();
    }
}

public sealed class CourseConfig : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");
        builder.Property(x => x.Code).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.ScheduleSlot).HasMaxLength(50);
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class ExamConfig : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("Exams");
        builder.HasMany(x => x.SeatAssignments).WithOne().HasForeignKey(x => x.ExamId);
        builder.Navigation(x => x.SeatAssignments)
            .HasField("_seats")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class ExamSeatConfig : IEntityTypeConfiguration<ExamSeat>
{
    public void Configure(EntityTypeBuilder<ExamSeat> builder)
    {
        builder.ToTable("ExamSeats");
        builder.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId);
    }
}

public sealed class AttendanceSessionConfig : IEntityTypeConfiguration<AttendanceSession>
{
    public void Configure(EntityTypeBuilder<AttendanceSession> builder)
    {
        builder.ToTable("AttendanceSessions");
        builder.HasMany(x => x.Records).WithOne().HasForeignKey(x => x.SessionId);
        builder.Navigation(x => x.Records)
            .HasField("_records")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class UserAccountConfig : IEntityTypeConfiguration<UserAccount>
{
    public void Configure(EntityTypeBuilder<UserAccount> builder)
    {
        builder.ToTable("UserAccounts");
        builder.Property(x => x.Username).HasMaxLength(50).IsRequired();
        builder.Property(x => x.DisplayName).HasMaxLength(200);
        builder.HasIndex(x => x.Username).IsUnique();
    }
}

public sealed class GradeEntryConfig : IEntityTypeConfiguration<GradeEntry>
{
    public void Configure(EntityTypeBuilder<GradeEntry> builder)
    {
        builder.ToTable("GradeEntries");
        builder.Property(x => x.Midterm).HasPrecision(5, 2);
        builder.Property(x => x.Coursework).HasPrecision(5, 2);
        builder.Property(x => x.Final).HasPrecision(5, 2);
        builder.HasIndex(x => new { x.CourseId, x.StudentId }).IsUnique();
        builder.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId);
        builder.Ignore(x => x.Total);
        builder.Ignore(x => x.Letter);
    }
}

public sealed class FeeAccountConfig : IEntityTypeConfiguration<FeeAccount>
{
    public void Configure(EntityTypeBuilder<FeeAccount> builder)
    {
        builder.ToTable("FeeAccounts");
        builder.Property(x => x.TuitionAmount).HasPrecision(18, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
        builder.Ignore(x => x.Balance);
        builder.Ignore(x => x.Status);
    }
}
