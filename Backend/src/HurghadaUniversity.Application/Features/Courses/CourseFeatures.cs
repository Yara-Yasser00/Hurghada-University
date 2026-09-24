using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using MediatR;

namespace HurghadaUniversity.Application.Features.Courses;

public sealed record GetCoursesQuery(string? Search) : IRequest<Result<IReadOnlyList<CourseDto>>>;

public sealed class GetCoursesQueryHandler(ICourseRepository courses) : IRequestHandler<GetCoursesQuery, Result<IReadOnlyList<CourseDto>>>
{
    public async Task<Result<IReadOnlyList<CourseDto>>> Handle(GetCoursesQuery request, CancellationToken cancellationToken)
    {
        var list = await courses.SearchAsync(request.Search, cancellationToken);
        return Result.Success<IReadOnlyList<CourseDto>>(list.Select(Map).ToList());
    }

    internal static CourseDto Map(Course c) => new(
        c.Id, c.Code, c.Name, c.ArabicName, c.InstructorName, c.Room, c.Credits,
        c.EnrolledCount, c.ProgressPercent, c.DepartmentName, c.IsEnabled, c.ScheduleSlot);
}

public sealed record CreateCourseCommand(
    string Code,
    string Name,
    string ArabicName,
    string InstructorName,
    string Room,
    int Credits,
    string DepartmentName,
    string? ScheduleSlot) : IRequest<Result<CourseDto>>;

public sealed class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Credits).InclusiveBetween(1, 6);
    }
}

public sealed class CreateCourseCommandHandler(ICourseRepository courses, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateCourseCommand, Result<CourseDto>>
{
    public async Task<Result<CourseDto>> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        if (await courses.GetByCodeAsync(request.Code, cancellationToken) is not null)
            return Result.Failure<CourseDto>(Error.Conflict($"Course '{request.Code}' already exists."));

        var course = Course.Create(
            request.Code, request.Name, request.ArabicName, request.InstructorName,
            request.Room, request.Credits, request.DepartmentName, request.ScheduleSlot);

        await courses.AddAsync(course, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetCoursesQueryHandler.Map(course));
    }
}

public sealed record ToggleCourseCommand(Guid Id) : IRequest<Result<CourseDto>>;

public sealed class ToggleCourseCommandHandler(ICourseRepository courses, IUnitOfWork unitOfWork)
    : IRequestHandler<ToggleCourseCommand, Result<CourseDto>>
{
    public async Task<Result<CourseDto>> Handle(ToggleCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await courses.GetByIdAsync(request.Id, cancellationToken);
        if (course is null)
            return Result.Failure<CourseDto>(Error.NotFound(nameof(Course), request.Id));

        course.ToggleEnabled();
        courses.Update(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetCoursesQueryHandler.Map(course));
    }
}

public sealed record UpdateCourseCommand(
    Guid Id,
    string Name,
    string ArabicName,
    string InstructorName,
    string Room,
    int Credits,
    string DepartmentName,
    string? ScheduleSlot) : IRequest<Result<CourseDto>>;

public sealed class UpdateCourseCommandHandler(ICourseRepository courses, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateCourseCommand, Result<CourseDto>>
{
    public async Task<Result<CourseDto>> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await courses.GetByIdAsync(request.Id, cancellationToken);
        if (course is null)
            return Result.Failure<CourseDto>(Error.NotFound(nameof(Course), request.Id));

        try
        {
            course.Update(request.Name, request.ArabicName, request.InstructorName, request.Room,
                request.Credits, request.DepartmentName, request.ScheduleSlot);
        }
        catch (Domain.Exceptions.DomainException ex)
        {
            return Result.Failure<CourseDto>(Error.Validation(ex.Message));
        }

        courses.Update(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetCoursesQueryHandler.Map(course));
    }
}

public sealed record DeleteCourseCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteCourseCommandHandler(ICourseRepository courses, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteCourseCommand, Result>
{
    public async Task<Result> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await courses.GetByIdAsync(request.Id, cancellationToken);
        if (course is null)
            return Result.Failure(Error.NotFound(nameof(Course), request.Id));

        courses.Remove(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed record RegisterCourseCommand(Guid StudentId, Guid CourseId) : IRequest<Result>;

public sealed class RegisterCourseCommandHandler(
    IStudentRepository students,
    ICourseRepository courses,
    IEnrollmentRepository enrollments,
    IRegistrationWindowRepository windows,
    IUnitOfWork unitOfWork) : IRequestHandler<RegisterCourseCommand, Result>
{
    public async Task<Result> Handle(RegisterCourseCommand request, CancellationToken cancellationToken)
    {
        var window = await windows.GetCurrentAsync(cancellationToken);
        if (window is null || !window.IsOpen)
            return Result.Failure(Error.Conflict("Registration is currently closed."));

        var student = await students.GetByIdAsync(request.StudentId, cancellationToken);
        if (student is null)
            return Result.Failure(Error.NotFound(nameof(Student), request.StudentId));

        var course = await courses.GetByIdAsync(request.CourseId, cancellationToken);
        if (course is null || !course.IsEnabled)
            return Result.Failure(Error.Conflict("Course is not available for registration."));

        if (await enrollments.ExistsAsync(request.StudentId, request.CourseId, cancellationToken))
            return Result.Failure(Error.Conflict("Student is already registered in this course."));

        var current = await enrollments.GetByStudentAsync(request.StudentId, cancellationToken);
        var active = current.Where(e => e.Status == Domain.Enums.EnrollmentStatus.Registered).ToList();

        // load courses for credit + conflict checks
        var registeredCourses = new List<Course>();
        foreach (var e in active)
        {
            var c = await courses.GetByIdAsync(e.CourseId, cancellationToken);
            if (c is not null) registeredCourses.Add(c);
        }

        var credits = registeredCourses.Sum(c => c.Credits) + course.Credits;
        if (credits > window.CreditLimit)
            return Result.Failure(Error.Conflict($"Credit limit exceeded. Maximum is {window.CreditLimit} hours."));

        if (!string.IsNullOrWhiteSpace(course.ScheduleSlot))
        {
            var conflict = registeredCourses.FirstOrDefault(c =>
                !string.IsNullOrWhiteSpace(c.ScheduleSlot) &&
                string.Equals(c.ScheduleSlot, course.ScheduleSlot, StringComparison.OrdinalIgnoreCase));
            if (conflict is not null)
                return Result.Failure(Error.Conflict($"Schedule conflict with {conflict.Code}."));
        }

        await enrollments.AddAsync(CourseEnrollment.Create(request.StudentId, request.CourseId, window.Semester), cancellationToken);
        course.SetEnrollmentCount(course.EnrolledCount + 1);
        courses.Update(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed record DropCourseCommand(Guid StudentId, Guid CourseId) : IRequest<Result>;

public sealed class DropCourseCommandHandler(
    IEnrollmentRepository enrollments,
    ICourseRepository courses,
    IUnitOfWork unitOfWork) : IRequestHandler<DropCourseCommand, Result>
{
    public async Task<Result> Handle(DropCourseCommand request, CancellationToken cancellationToken)
    {
        var list = await enrollments.GetByStudentAsync(request.StudentId, cancellationToken);
        var enrollment = list.FirstOrDefault(e =>
            e.CourseId == request.CourseId &&
            e.Status == Domain.Enums.EnrollmentStatus.Registered);

        if (enrollment is null)
            return Result.Failure(Error.NotFound("Enrollment", request.CourseId));

        enrollment.Drop();
        enrollments.Update(enrollment);

        var course = await courses.GetByIdAsync(request.CourseId, cancellationToken);
        if (course is not null)
        {
            course.SetEnrollmentCount(Math.Max(0, course.EnrolledCount - 1));
            courses.Update(course);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed record EnrollmentDto(
    Guid CourseId,
    string CourseCode,
    string CourseName,
    int Credits,
    string Status,
    string? ScheduleSlot);

public sealed record GetStudentEnrollmentsQuery(Guid StudentId) : IRequest<Result<IReadOnlyList<EnrollmentDto>>>;

public sealed class GetStudentEnrollmentsQueryHandler(
    IEnrollmentRepository enrollments,
    ICourseRepository courses) : IRequestHandler<GetStudentEnrollmentsQuery, Result<IReadOnlyList<EnrollmentDto>>>
{
    public async Task<Result<IReadOnlyList<EnrollmentDto>>> Handle(
        GetStudentEnrollmentsQuery request,
        CancellationToken cancellationToken)
    {
        var list = await enrollments.GetByStudentAsync(request.StudentId, cancellationToken);
        var result = new List<EnrollmentDto>();
        foreach (var e in list.Where(x => x.Status == Domain.Enums.EnrollmentStatus.Registered))
        {
            var course = await courses.GetByIdAsync(e.CourseId, cancellationToken);
            if (course is null) continue;
            result.Add(new EnrollmentDto(
                course.Id, course.Code, course.Name, course.Credits, e.Status.ToString(), course.ScheduleSlot));
        }

        return Result.Success<IReadOnlyList<EnrollmentDto>>(result);
    }
}
