using HurghadaUniversity.Application.Abstractions.Security;
using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;
using HurghadaUniversity.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HurghadaUniversity.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.EnsureCreatedAsync();
        await EnsureCmsSchemaAsync(db);

        if (!await db.Faculties.AnyAsync())
            await SeedCoreAsync(db, hasher);

        if (!await db.SiteProfiles.AnyAsync())
            await SeedCmsAsync(db);

        await EnrichFacultyCmsFieldsAsync(db);
        await db.SaveChangesAsync();
    }

    private static async Task EnsureCmsSchemaAsync(AppDbContext db)
    {
        // EnsureCreated does not alter an existing database — add CMS columns/tables safely.
        await db.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('Faculties', 'Description') IS NULL
                ALTER TABLE Faculties ADD Description nvarchar(2000) NOT NULL CONSTRAINT DF_Faculties_Description DEFAULT('');
            IF COL_LENGTH('Faculties', 'ImageUrl') IS NULL
                ALTER TABLE Faculties ADD ImageUrl nvarchar(500) NOT NULL CONSTRAINT DF_Faculties_ImageUrl DEFAULT('/assets/campus/study.png');
            IF COL_LENGTH('Faculties', 'Slug') IS NULL
                ALTER TABLE Faculties ADD Slug nvarchar(100) NOT NULL CONSTRAINT DF_Faculties_Slug DEFAULT('');
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.SiteProfiles', N'U') IS NULL
            BEGIN
                CREATE TABLE SiteProfiles (
                    Id uniqueidentifier NOT NULL PRIMARY KEY,
                    BrandNameAr nvarchar(200) NOT NULL,
                    BrandNameEn nvarchar(200) NOT NULL,
                    Tagline nvarchar(500) NOT NULL,
                    TaglineEn nvarchar(500) NOT NULL CONSTRAINT DF_SiteProfiles_TaglineEn_Create DEFAULT(''),
                    AboutIntro nvarchar(4000) NOT NULL,
                    AboutIntroEn nvarchar(4000) NOT NULL CONSTRAINT DF_SiteProfiles_AboutIntroEn_Create DEFAULT(''),
                    AddressLines nvarchar(1000) NOT NULL,
                    AddressLinesEn nvarchar(1000) NOT NULL CONSTRAINT DF_SiteProfiles_AddressLinesEn_Create DEFAULT(''),
                    Phone nvarchar(50) NOT NULL,
                    Email nvarchar(200) NOT NULL,
                    Website nvarchar(300) NOT NULL,
                    HeroImageUrl nvarchar(500) NOT NULL,
                    GlobalImageUrl nvarchar(500) NOT NULL,
                    PresidentName nvarchar(200) NOT NULL,
                    PresidentTitle nvarchar(200) NOT NULL,
                    PresidentTitleEn nvarchar(200) NOT NULL CONSTRAINT DF_SiteProfiles_PresidentTitleEn_Create DEFAULT(''),
                    CreatedAtUtc datetime2 NOT NULL,
                    UpdatedAtUtc datetime2 NULL,
                    IsDeleted bit NOT NULL
                );
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.SiteNewsItems', N'U') IS NULL
            BEGIN
                CREATE TABLE SiteNewsItems (
                    Id uniqueidentifier NOT NULL PRIMARY KEY,
                    Category nvarchar(100) NOT NULL,
                    CategoryEn nvarchar(100) NOT NULL CONSTRAINT DF_SiteNewsItems_CategoryEn_Create DEFAULT(''),
                    Title nvarchar(400) NOT NULL,
                    TitleEn nvarchar(400) NOT NULL CONSTRAINT DF_SiteNewsItems_TitleEn_Create DEFAULT(''),
                    Summary nvarchar(2000) NOT NULL,
                    SummaryEn nvarchar(2000) NOT NULL CONSTRAINT DF_SiteNewsItems_SummaryEn_Create DEFAULT(''),
                    ImageUrl nvarchar(500) NOT NULL,
                    PublishedLabel nvarchar(50) NOT NULL,
                    IsFeatured bit NOT NULL,
                    IsPublished bit NOT NULL,
                    SortOrder int NOT NULL,
                    CreatedAtUtc datetime2 NOT NULL,
                    UpdatedAtUtc datetime2 NULL,
                    IsDeleted bit NOT NULL
                );
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.SiteEvents', N'U') IS NULL
            BEGIN
                CREATE TABLE SiteEvents (
                    Id uniqueidentifier NOT NULL PRIMARY KEY,
                    Day nvarchar(10) NOT NULL,
                    Month nvarchar(20) NOT NULL,
                    MonthEn nvarchar(20) NOT NULL CONSTRAINT DF_SiteEvents_MonthEn DEFAULT(''),
                    Title nvarchar(400) NOT NULL,
                    TitleEn nvarchar(400) NOT NULL CONSTRAINT DF_SiteEvents_TitleEn DEFAULT(''),
                    Location nvarchar(300) NOT NULL,
                    LocationEn nvarchar(300) NOT NULL CONSTRAINT DF_SiteEvents_LocationEn DEFAULT(''),
                    Category nvarchar(100) NOT NULL,
                    CategoryEn nvarchar(100) NOT NULL CONSTRAINT DF_SiteEvents_CategoryEn DEFAULT(''),
                    IsPublished bit NOT NULL,
                    SortOrder int NOT NULL,
                    CreatedAtUtc datetime2 NOT NULL,
                    UpdatedAtUtc datetime2 NULL,
                    IsDeleted bit NOT NULL
                );
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('SiteProfiles', 'TaglineEn') IS NULL
                ALTER TABLE SiteProfiles ADD TaglineEn nvarchar(500) NOT NULL CONSTRAINT DF_SiteProfiles_TaglineEn DEFAULT('');
            IF COL_LENGTH('SiteProfiles', 'AboutIntroEn') IS NULL
                ALTER TABLE SiteProfiles ADD AboutIntroEn nvarchar(4000) NOT NULL CONSTRAINT DF_SiteProfiles_AboutIntroEn DEFAULT('');
            IF COL_LENGTH('SiteProfiles', 'AddressLinesEn') IS NULL
                ALTER TABLE SiteProfiles ADD AddressLinesEn nvarchar(1000) NOT NULL CONSTRAINT DF_SiteProfiles_AddressLinesEn DEFAULT('');
            IF COL_LENGTH('SiteProfiles', 'PresidentTitleEn') IS NULL
                ALTER TABLE SiteProfiles ADD PresidentTitleEn nvarchar(200) NOT NULL CONSTRAINT DF_SiteProfiles_PresidentTitleEn DEFAULT('');
            IF COL_LENGTH('SiteNewsItems', 'CategoryEn') IS NULL
                ALTER TABLE SiteNewsItems ADD CategoryEn nvarchar(100) NOT NULL CONSTRAINT DF_SiteNewsItems_CategoryEn DEFAULT('');
            IF COL_LENGTH('SiteNewsItems', 'TitleEn') IS NULL
                ALTER TABLE SiteNewsItems ADD TitleEn nvarchar(400) NOT NULL CONSTRAINT DF_SiteNewsItems_TitleEn DEFAULT('');
            IF COL_LENGTH('SiteNewsItems', 'SummaryEn') IS NULL
                ALTER TABLE SiteNewsItems ADD SummaryEn nvarchar(2000) NOT NULL CONSTRAINT DF_SiteNewsItems_SummaryEn DEFAULT('');
            IF COL_LENGTH('SiteEvents', 'MonthEn') IS NULL
                ALTER TABLE SiteEvents ADD MonthEn nvarchar(20) NOT NULL CONSTRAINT DF_SiteEvents_MonthEn DEFAULT('');
            IF COL_LENGTH('SiteEvents', 'TitleEn') IS NULL
                ALTER TABLE SiteEvents ADD TitleEn nvarchar(400) NOT NULL CONSTRAINT DF_SiteEvents_TitleEn DEFAULT('');
            IF COL_LENGTH('SiteEvents', 'LocationEn') IS NULL
                ALTER TABLE SiteEvents ADD LocationEn nvarchar(300) NOT NULL CONSTRAINT DF_SiteEvents_LocationEn DEFAULT('');
            IF COL_LENGTH('SiteEvents', 'CategoryEn') IS NULL
                ALTER TABLE SiteEvents ADD CategoryEn nvarchar(100) NOT NULL CONSTRAINT DF_SiteEvents_CategoryEn DEFAULT('');
            """);
    }

    private static async Task SeedCmsAsync(AppDbContext db)
    {
        db.SiteProfiles.Add(SiteProfile.CreateDefault());

        db.SiteNewsItems.AddRange(
            SiteNews.Create(
                "فعاليات", "Events",
                "رئيس الجامعة ومحافظ البحر الأحمر يشهدان ندوة بمهرجان سينما الشباب",
                "University President and Red Sea Governor attend Youth Cinema Festival seminar",
                "ندوة «من الحكاية إلى الأثر» بحضور قيادات المحافظة وممثلي وزارات التضامن والثقافة والشباب.",
                "From Story to Impact seminar with governorate leaders and ministry representatives.",
                "",
                "2026",
                isFeatured: true,
                sortOrder: 1),
            SiteNews.Create(
                "أكاديمي", "Academic",
                "جامعة الغردقة تستكمل استعداداتها لانطلاق الدراسة بكلية العلوم",
                "Hurghada University prepares for studies at the Faculty of Science",
                "متابعة انتظام تقديم ملفات الطلاب الجدد بكلية العلوم ضمن خطط التوسع الأكاديمي.",
                "New student file submissions continue at the Faculty of Science as part of academic expansion.",
                "",
                "2026",
                sortOrder: 2),
            SiteNews.Create(
                "سياحة", "Tourism",
                "كلية السياحة والفنادق تطبق برنامج فاتيل لإدارة الضيافة الدولية",
                "Faculty of Tourism applies Vatel hospitality management program",
                "خطوة نحو العالمية عبر برنامج تدريبي فرنسي متخصص في الضيافة.",
                "A step toward international standards through a French hospitality training program.",
                "",
                "2026",
                sortOrder: 3),
            SiteNews.Create(
                "خريجون", "Alumni",
                "الجامعة تحتفي بخريجي الماجستير المهني بحضور محافظ البحر الأحمر",
                "University celebrates professional master's graduates with the Red Sea Governor",
                "حفل تخرج دفعة برنامج الماجستير المهني في إدارة الأعمال والمحاسبة.",
                "Graduation ceremony for the professional MBA and accounting cohort.",
                "",
                "2026",
                sortOrder: 4));

        db.SiteEvents.AddRange(
            SiteEvent.Create("10", "أبر", "Apr", "يوم تعريفي لطلاب كلية العلوم الجدد", "Orientation day for new Faculty of Science students", "كلية العلوم — الحرم الجامعي", "Faculty of Science — Campus", "طلاب", "Students", 1),
            SiteEvent.Create("18", "أبر", "Apr", "ورشة التطوير المهني للخريجين", "Professional development workshop for graduates", "مركز التطوير المهني بالغردقة", "Career Development Center, Hurghada", "تدريب", "Training", 2),
            SiteEvent.Create("02", "ماي", "May", "ملتقى السياحة والضيافة بالبحر الأحمر", "Red Sea tourism and hospitality forum", "كلية السياحة والفنادق", "Faculty of Tourism & Hotels", "مؤتمر", "Conference", 3),
            SiteEvent.Create("15", "ماي", "May", "يوم مفتوح للحاسبات والذكاء الاصطناعي", "Open day for Computing & AI", "كلية الحاسبات والذكاء الاصطناعي", "Faculty of Computers & AI", "أكاديمي", "Academic", 4));

        await Task.CompletedTask;
    }

    private static async Task EnrichFacultyCmsFieldsAsync(AppDbContext db)
    {
        var faculties = await db.Faculties.ToListAsync();
        foreach (var faculty in faculties)
        {
            var (slug, description, image) = faculty.Name switch
            {
                "Education" => ("edu",
                    "أقدم كليات الموقع — بدأت كفرع من تربية قنا عام 1995 واستقلت لاحقًا ضمن مسار إنشاء الجامعة.",
                    "/assets/campus/study.png"),
                "Tourism & Hotels" => ("tourism",
                    "برامج سياحة وضيافة مرتبطة بسوق العمل في الغردقة والبحر الأحمر، مع شراكات دولية.",
                    "/assets/campus/life.png"),
                "Al-Alsun (Languages)" => ("alsun",
                    "برامج لغات وترجمة تؤهل الطلاب للعمل في السياحة والدبلوماسية وسوق الخدمات.",
                    "/assets/images/college1.jpg"),
                "Computers & Artificial Intelligence" => ("fci",
                    "تخصصات حوسبة وذكاء اصطناعي وتقنيات معلومات حديثة.",
                    "/assets/campus/faculty.png"),
                _ => (null, null, null)
            };

            if (slug is null) continue;
            if (!string.IsNullOrWhiteSpace(faculty.Slug) && !string.IsNullOrWhiteSpace(faculty.Description))
                continue;

            faculty.Update(
                faculty.Name,
                faculty.ArabicName,
                faculty.Dean,
                faculty.DepartmentCount,
                faculty.StudentCount,
                description,
                image,
                slug);
        }
    }

    private static async Task SeedCoreAsync(AppDbContext db, IPasswordHasher hasher)
    {
        var computing = Faculty.Create(
            "Computers & Artificial Intelligence", "كلية الحاسبات والذكاء الاصطناعي", "Dean of Computers & AI", 4, 1248,
            "تخصصات حوسبة وذكاء اصطناعي وتقنيات معلومات حديثة.", "/assets/campus/faculty.png", "fci");
        var education = Faculty.Create(
            "Education", "كلية التربية", "Prof. Dr. Mahfouz Abdel Sattar", 8, 2140,
            "أقدم كليات الموقع — بدأت كفرع من تربية قنا عام 1995 واستقلت لاحقًا ضمن مسار إنشاء الجامعة.",
            "/assets/campus/study.png", "edu");
        var tourism = Faculty.Create(
            "Tourism & Hotels", "كلية السياحة والفنادق", "Prof. Dr. Mohamed Abu Taleb", 5, 986,
            "برامج سياحة وضيافة مرتبطة بسوق العمل في الغردقة والبحر الأحمر، مع شراكات دولية.",
            "/assets/campus/life.png", "tourism");
        var alsun = Faculty.Create(
            "Al-Alsun (Languages)", "كلية الألسن", "Dean of Al-Alsun", 4, 720,
            "برامج لغات وترجمة تؤهل الطلاب للعمل في السياحة والدبلوماسية وسوق الخدمات.",
            "/assets/images/college1.jpg", "alsun");
        db.Faculties.AddRange(computing, education, tourism, alsun);

        var cs = Department.Create("D-01", "Computer Science", computing.Id, "Dean of Computers & AI", 4);
        var ai = Department.Create("D-02", "Artificial Intelligence", computing.Id, "Dr. Omar Adel", 3);
        var curriculum = Department.Create("D-03", "Curriculum & Instruction", education.Id, "Prof. Dr. Mahfouz Abdel Sattar", 5);
        var english = Department.Create("D-04", "English Language", alsun.Id, "Head of English Dept.", 4);
        var hotel = Department.Create("D-05", "Hotel Management", tourism.Id, "Prof. Dr. Mohamed Abu Taleb", 3);
        db.Departments.AddRange(cs, ai, curriculum, english, hotel);

        var salma = StaffMember.Create("HU-1028", "Dr. Salma Hassan", "Associate Professor", "Computer Science", ContractType.FullTime, 2018, cs.Id);
        var omar = StaffMember.Create("HU-1142", "Dr. Omar Adel", "Lecturer", "Artificial Intelligence", ContractType.FullTime, 2020, ai.Id);
        var mona = StaffMember.Create("HU-0874", "Prof. Mona Fathy", "Professor", "Educational Psychology", ContractType.FullTime, 2012, curriculum.Id);
        var reem = StaffMember.Create("HU-1309", "Ms. Reem Samir", "Lab Specialist", "Tourism & Hotels", ContractType.PartTime, 2022, hotel.Id);
        var ahmedStaff = StaffMember.Create("HU-0955", "Mr. Ahmed Salah", "Administrator", "Student Affairs", ContractType.FullTime, 2016);
        db.StaffMembers.AddRange(salma, omar, mona, reem, ahmedStaff);

        var nour = Student.Create("2024010001", "Nour Ahmed Mahmoud", computing.Id, "Third", 3.82m);
        var youssef = Student.Create("2024010024", "Youssef Mohamed Ali", education.Id, "Second", 3.56m);
        var mariam = Student.Create("2023010187", "Mariam Khaled Hassan", alsun.Id, "Fourth", 3.91m);
        var omarStudent = Student.Create("2024010119", "Omar Tarek Ibrahim", computing.Id, "Third", 3.27m, RecordStatus.Review);
        var farida = Student.Create("2022010032", "Farida Mostafa Salem", tourism.Id, "Fourth", 3.68m);
        db.Students.AddRange(nour, youssef, mariam, omarStudent, farida);

        var c341 = Course.Create("CS 341", "Artificial Intelligence", "الذكاء الاصطناعي", "Dr. Salma Hassan", "B-204", 3, "Computer Science", "Sun-09:00", salma.Id, cs.Id);
        var c315 = Course.Create("CS 315", "Database Systems", "نظم قواعد البيانات", "Dr. Omar Adel", "Lab 3", 3, "Artificial Intelligence", "Mon-10:30", omar.Id, ai.Id);
        var edu210 = Course.Create("EDU 210", "Educational Psychology", "علم النفس التربوي", "Prof. Mona Fathy", "A-112", 3, "Education", "Sun-12:00", mona.Id, curriculum.Id);
        var c322 = Course.Create("CS 322", "Computer Networks", "شبكات الحاسب", "Dr. Karim Nabil", "B-107", 3, "Computer Science", "Tue-09:00", null, cs.Id);
        var tour102 = Course.Create("TOUR 102", "Hospitality Principles", "مبادئ الضيافة", "Dr. Reem Samir", "C-301", 2, "Tourism & Hotels", "Mon-14:00", reem.Id, hotel.Id);
        c341.SetEnrollmentCount(42); c341.SetProgress(68);
        c315.SetEnrollmentCount(38); c315.SetProgress(74);
        edu210.SetEnrollmentCount(51); edu210.SetProgress(61);
        c322.SetEnrollmentCount(35); c322.SetProgress(79);
        tour102.SetEnrollmentCount(46); tour102.SetProgress(56);
        db.Courses.AddRange(c341, c315, edu210, c322, tour102);

        db.CollegeAdmins.AddRange(
            CollegeAdmin.Create("CA-01", "Prof. Dr. Mahfouz Abdel Sattar", education.Id, "dr.mhfouz@hu-edu.svu.edu.eg"),
            CollegeAdmin.Create("CA-02", "Prof. Dr. Mohamed Abu Taleb", tourism.Id, "tourism@hurghada.edu.eg"),
            CollegeAdmin.Create("CA-03", "Dean of Al-Alsun", alsun.Id, "alsun@hurghada.edu.eg"),
            CollegeAdmin.Create("CA-04", "Dean of Computers & AI", computing.Id, "fci@hurghada.edu.eg"));

        db.Exams.AddRange(
            Exam.Create(c322.Id, c322.Code, c322.Name, new DateOnly(2026, 3, 18), new TimeOnly(9, 0), "Hall A", 48),
            Exam.Create(c315.Id, c315.Code, c315.Name, new DateOnly(2026, 3, 20), new TimeOnly(11, 0), "Hall B", 40),
            Exam.Create(c341.Id, c341.Code, c341.Name, new DateOnly(2026, 3, 23), new TimeOnly(9, 0), "Hall C", 52),
            Exam.Create(edu210.Id, edu210.Code, edu210.Name, new DateOnly(2026, 3, 25), new TimeOnly(14, 0), "Hall A", 60));

        db.RegistrationWindows.Add(RegistrationWindow.Create("Spring 2026", new DateOnly(2026, 3, 21), 18));

        db.CourseEnrollments.AddRange(
            CourseEnrollment.Create(nour.Id, c341.Id),
            CourseEnrollment.Create(nour.Id, c315.Id),
            CourseEnrollment.Create(nour.Id, edu210.Id),
            CourseEnrollment.Create(nour.Id, c322.Id));

        db.FeeAccounts.Add(FeeAccount.Create(nour.Id, "Spring 2026", 18500m, 12000m, new DateOnly(2026, 3, 28)));

        db.Announcements.AddRange(
            Announcement.Create("University seal adopted", "University Council adopted the official logo designed by Dr. Omran Mohamed Ahmed Hassan.", "University", new DateOnly(2024, 11, 27)),
            Announcement.Create("Independent university status", "Hurghada University established by Prime Ministerial Decision No. 3005 of 2024.", "Public", new DateOnly(2024, 1, 1)),
            Announcement.Create("Fee payment deadline", "Semester fee installment due before March 28.", "Students", new DateOnly(2026, 3, 8)));

        db.Notifications.AddRange(
            Notification.Create("Registration reminder", "Spring 2026 add/drop closes on March 21.", "/admin/registration"),
            Notification.Create("Grades pending publication", "CS 341 midterm grades are ready for review.", "/instructor/grades"),
            Notification.Create("Exam seating published", "Computer Networks · Hall A · Seat 046", "/student/grades"));

        var password = hasher.Hash("hurghada");
        var studentUser = UserAccount.Create("2024010001", password, "Nour Ahmed", UserRole.Student);
        var instructorUser = UserAccount.Create("HU-1028", password, "Dr. Salma Hassan", UserRole.Instructor);
        var adminUser = UserAccount.Create("HU-ADMIN", password, "Ahmed El-Masry", UserRole.Admin);
        var hrUser = UserAccount.Create("HU-HR01", password, "Mariam Fouad", UserRole.Hr);
        db.UserAccounts.AddRange(studentUser, instructorUser, adminUser, hrUser);

        nour.LinkUser(studentUser.Id);
        salma.LinkUser(instructorUser.Id);

        var lastAdmin = db.CollegeAdmins.Local.Last();
        lastAdmin.ToggleStatus();

        await Task.CompletedTask;
    }
}
