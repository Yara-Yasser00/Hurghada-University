using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;
using MediatR;

namespace HurghadaUniversity.Application.Features.Students;

public sealed record GetStudentsQuery(string? Search) : IRequest<Result<IReadOnlyList<StudentDto>>>;

public sealed class GetStudentsQueryHandler(IStudentRepository students) : IRequestHandler<GetStudentsQuery, Result<IReadOnlyList<StudentDto>>>
{
    public async Task<Result<IReadOnlyList<StudentDto>>> Handle(GetStudentsQuery request, CancellationToken cancellationToken)
    {
        var list = await students.SearchAsync(request.Search, cancellationToken);
        return Result.Success<IReadOnlyList<StudentDto>>(list.Select(Map).ToList());
    }

    internal static StudentDto Map(Student s) => new(
        s.Id,
        s.UniversityId,
        s.FullName,
        s.FacultyId,
        s.Faculty?.Name ?? string.Empty,
        s.Level,
        s.Gpa,
        s.Status.ToString());
}

public sealed record GetStudentByIdQuery(Guid Id) : IRequest<Result<StudentDto>>;

public sealed class GetStudentByIdQueryHandler(IStudentRepository students) : IRequestHandler<GetStudentByIdQuery, Result<StudentDto>>
{
    public async Task<Result<StudentDto>> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await students.GetByIdAsync(request.Id, cancellationToken);
        return student is null
            ? Result.Failure<StudentDto>(Error.NotFound(nameof(Student), request.Id))
            : Result.Success(GetStudentsQueryHandler.Map(student));
    }
}

public sealed record CreateStudentCommand(
    string? UniversityId,
    string FullName,
    Guid FacultyId,
    string Level,
    decimal Gpa,
    RecordStatus Status) : IRequest<Result<StudentDto>>;

public sealed class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FacultyId).NotEmpty();
        RuleFor(x => x.Gpa).InclusiveBetween(0, 4);
        RuleFor(x => x.Level).NotEmpty();
    }
}

public sealed class CreateStudentCommandHandler(
    IStudentRepository students,
    IFacultyRepository faculties,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateStudentCommand, Result<StudentDto>>
{
    public async Task<Result<StudentDto>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var faculty = await faculties.GetByIdAsync(request.FacultyId, cancellationToken);
        if (faculty is null)
            return Result.Failure<StudentDto>(Error.NotFound(nameof(Faculty), request.FacultyId));

        if (!string.IsNullOrWhiteSpace(request.UniversityId))
        {
            var existing = await students.GetByUniversityIdAsync(request.UniversityId, cancellationToken);
            if (existing is not null)
                return Result.Failure<StudentDto>(Error.Conflict($"University ID '{request.UniversityId}' already exists."));
        }

        var student = Student.Create(request.UniversityId ?? string.Empty, request.FullName, request.FacultyId, request.Level, request.Gpa, request.Status);
        await students.AddAsync(student, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // reload with faculty
        var created = await students.GetByIdAsync(student.Id, cancellationToken) ?? student;
        return Result.Success(GetStudentsQueryHandler.Map(created));
    }
}

public sealed record UpdateStudentCommand(
    Guid Id,
    string FullName,
    Guid FacultyId,
    string Level,
    decimal Gpa,
    RecordStatus Status) : IRequest<Result<StudentDto>>;

public sealed class UpdateStudentCommandValidator : AbstractValidator<UpdateStudentCommand>
{
    public UpdateStudentCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty();
        RuleFor(x => x.Gpa).InclusiveBetween(0, 4);
    }
}

public sealed class UpdateStudentCommandHandler(
    IStudentRepository students,
    IFacultyRepository faculties,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateStudentCommand, Result<StudentDto>>
{
    public async Task<Result<StudentDto>> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await students.GetByIdAsync(request.Id, cancellationToken);
        if (student is null)
            return Result.Failure<StudentDto>(Error.NotFound(nameof(Student), request.Id));

        if (await faculties.GetByIdAsync(request.FacultyId, cancellationToken) is null)
            return Result.Failure<StudentDto>(Error.NotFound(nameof(Faculty), request.FacultyId));

        student.Update(request.FullName, request.FacultyId, request.Level, request.Gpa, request.Status);
        students.Update(student);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await students.GetByIdAsync(student.Id, cancellationToken) ?? student;
        return Result.Success(GetStudentsQueryHandler.Map(updated));
    }
}
