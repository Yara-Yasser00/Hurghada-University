using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;
using MediatR;

namespace HurghadaUniversity.Application.Features.Faculties
{
    public sealed record GetFacultiesQuery : IRequest<Result<IReadOnlyList<FacultyDto>>>;

    public sealed class GetFacultiesQueryHandler(IFacultyRepository faculties)
        : IRequestHandler<GetFacultiesQuery, Result<IReadOnlyList<FacultyDto>>>
    {
        public async Task<Result<IReadOnlyList<FacultyDto>>> Handle(GetFacultiesQuery request, CancellationToken cancellationToken)
        {
            var list = await faculties.ListAsync(cancellationToken);
            return Result.Success<IReadOnlyList<FacultyDto>>(list.Select(Map).ToList());
        }

        internal static FacultyDto Map(Faculty f) => new(
            f.Id, f.Name, f.ArabicName, f.Dean, f.DepartmentCount, f.StudentCount,
            f.Status.ToString(), f.IsEnabled, f.Description, f.ImageUrl, f.Slug);
    }

    public sealed record CreateFacultyCommand(
        string Name,
        string ArabicName,
        string Dean,
        int DepartmentCount,
        int StudentCount,
        string? Description = null,
        string? ImageUrl = null,
        string? Slug = null)
        : IRequest<Result<FacultyDto>>;

    public sealed class CreateFacultyCommandValidator : AbstractValidator<CreateFacultyCommand>
    {
        public CreateFacultyCommandValidator() => RuleFor(x => x.Name).NotEmpty();
    }

    public sealed class CreateFacultyCommandHandler(IFacultyRepository faculties, IUnitOfWork unitOfWork)
        : IRequestHandler<CreateFacultyCommand, Result<FacultyDto>>
    {
        public async Task<Result<FacultyDto>> Handle(CreateFacultyCommand request, CancellationToken cancellationToken)
        {
            if (await faculties.GetByNameAsync(request.Name, cancellationToken) is not null)
                return Result.Failure<FacultyDto>(Error.Conflict($"Faculty '{request.Name}' already exists."));

            var faculty = Faculty.Create(
                request.Name, request.ArabicName, request.Dean, request.DepartmentCount, request.StudentCount,
                request.Description, request.ImageUrl, request.Slug);
            await faculties.AddAsync(faculty, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetFacultiesQueryHandler.Map(faculty));
        }
    }

    public sealed record ToggleFacultyCommand(Guid Id) : IRequest<Result<FacultyDto>>;

    public sealed class ToggleFacultyCommandHandler(IFacultyRepository faculties, IUnitOfWork unitOfWork)
        : IRequestHandler<ToggleFacultyCommand, Result<FacultyDto>>
    {
        public async Task<Result<FacultyDto>> Handle(ToggleFacultyCommand request, CancellationToken cancellationToken)
        {
            var faculty = await faculties.GetByIdAsync(request.Id, cancellationToken);
            if (faculty is null)
                return Result.Failure<FacultyDto>(Error.NotFound(nameof(Faculty), request.Id));

            faculty.ToggleEnabled();
            faculties.Update(faculty);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetFacultiesQueryHandler.Map(faculty));
        }
    }
}

namespace HurghadaUniversity.Application.Features.Departments
{
    public sealed record GetDepartmentsQuery : IRequest<Result<IReadOnlyList<DepartmentDto>>>;

    public sealed class GetDepartmentsQueryHandler(IDepartmentRepository departments)
        : IRequestHandler<GetDepartmentsQuery, Result<IReadOnlyList<DepartmentDto>>>
    {
        public async Task<Result<IReadOnlyList<DepartmentDto>>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
        {
            var list = await departments.ListAsync(cancellationToken);
            return Result.Success<IReadOnlyList<DepartmentDto>>(list.Select(d => new DepartmentDto(
                d.Id, d.Code, d.Name, d.FacultyId, d.Faculty?.Name ?? string.Empty, d.Head, d.Programs, d.Status.ToString())).ToList());
        }
    }

    public sealed record CreateDepartmentCommand(string? Code, string Name, Guid FacultyId, string Head, int Programs)
        : IRequest<Result<DepartmentDto>>;

    public sealed class CreateDepartmentCommandHandler(
        IDepartmentRepository departments,
        IFacultyRepository faculties,
        IUnitOfWork unitOfWork) : IRequestHandler<CreateDepartmentCommand, Result<DepartmentDto>>
    {
        public async Task<Result<DepartmentDto>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
        {
            var faculty = await faculties.GetByIdAsync(request.FacultyId, cancellationToken);
            if (faculty is null)
                return Result.Failure<DepartmentDto>(Error.NotFound(nameof(Faculty), request.FacultyId));

            var dept = Department.Create(request.Code ?? string.Empty, request.Name, request.FacultyId, request.Head, request.Programs);
            await departments.AddAsync(dept, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(new DepartmentDto(
                dept.Id, dept.Code, dept.Name, dept.FacultyId, faculty.Name, dept.Head, dept.Programs, dept.Status.ToString()));
        }
    }
}

namespace HurghadaUniversity.Application.Features.Staff
{
    public sealed record GetStaffQuery(string? Search) : IRequest<Result<IReadOnlyList<StaffDto>>>;

    public sealed class GetStaffQueryHandler(IStaffRepository staff)
        : IRequestHandler<GetStaffQuery, Result<IReadOnlyList<StaffDto>>>
    {
        public async Task<Result<IReadOnlyList<StaffDto>>> Handle(GetStaffQuery request, CancellationToken cancellationToken)
        {
            var list = await staff.SearchAsync(request.Search, cancellationToken);
            return Result.Success<IReadOnlyList<StaffDto>>(list.Select(s => new StaffDto(
                s.Id, s.StaffCode, s.FullName, s.RoleTitle, s.DepartmentName, s.Contract.ToString(), s.SinceYear)).ToList());
        }
    }

    public sealed record CreateStaffCommand(
        string? StaffCode,
        string FullName,
        string RoleTitle,
        string DepartmentName,
        ContractType Contract,
        int SinceYear) : IRequest<Result<StaffDto>>;

    public sealed class CreateStaffCommandHandler(IStaffRepository staff, IUnitOfWork unitOfWork)
        : IRequestHandler<CreateStaffCommand, Result<StaffDto>>
    {
        public async Task<Result<StaffDto>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
        {
            var member = StaffMember.Create(
                request.StaffCode ?? string.Empty, request.FullName, request.RoleTitle,
                request.DepartmentName, request.Contract, request.SinceYear);

            await staff.AddAsync(member, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new StaffDto(
                member.Id, member.StaffCode, member.FullName, member.RoleTitle,
                member.DepartmentName, member.Contract.ToString(), member.SinceYear));
        }
    }
}

namespace HurghadaUniversity.Application.Features.CollegeAdmins
{
    public sealed record GetCollegeAdminsQuery : IRequest<Result<IReadOnlyList<CollegeAdminDto>>>;

    public sealed class GetCollegeAdminsQueryHandler(ICollegeAdminRepository admins)
        : IRequestHandler<GetCollegeAdminsQuery, Result<IReadOnlyList<CollegeAdminDto>>>
    {
        public async Task<Result<IReadOnlyList<CollegeAdminDto>>> Handle(GetCollegeAdminsQuery request, CancellationToken cancellationToken)
        {
            var list = await admins.ListAsync(cancellationToken);
            return Result.Success<IReadOnlyList<CollegeAdminDto>>(list.Select(a => new CollegeAdminDto(
                a.Id, a.Code, a.FullName, a.FacultyId, a.Faculty?.Name ?? string.Empty, a.Email, a.Status.ToString())).ToList());
        }
    }

    public sealed record CreateCollegeAdminCommand(string? Code, string FullName, Guid FacultyId, string Email)
        : IRequest<Result<CollegeAdminDto>>;

    public sealed class CreateCollegeAdminCommandHandler(
        ICollegeAdminRepository admins,
        IFacultyRepository faculties,
        IUnitOfWork unitOfWork) : IRequestHandler<CreateCollegeAdminCommand, Result<CollegeAdminDto>>
    {
        public async Task<Result<CollegeAdminDto>> Handle(CreateCollegeAdminCommand request, CancellationToken cancellationToken)
        {
            var faculty = await faculties.GetByIdAsync(request.FacultyId, cancellationToken);
            if (faculty is null)
                return Result.Failure<CollegeAdminDto>(Error.NotFound(nameof(Faculty), request.FacultyId));

            var admin = CollegeAdmin.Create(request.Code ?? string.Empty, request.FullName, request.FacultyId, request.Email);
            await admins.AddAsync(admin, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new CollegeAdminDto(
                admin.Id, admin.Code, admin.FullName, admin.FacultyId, faculty.Name, admin.Email, admin.Status.ToString()));
        }
    }

    public sealed record ToggleCollegeAdminCommand(Guid Id) : IRequest<Result<CollegeAdminDto>>;

    public sealed class ToggleCollegeAdminCommandHandler(ICollegeAdminRepository admins, IUnitOfWork unitOfWork)
        : IRequestHandler<ToggleCollegeAdminCommand, Result<CollegeAdminDto>>
    {
        public async Task<Result<CollegeAdminDto>> Handle(ToggleCollegeAdminCommand request, CancellationToken cancellationToken)
        {
            var admin = await admins.GetByIdAsync(request.Id, cancellationToken);
            if (admin is null)
                return Result.Failure<CollegeAdminDto>(Error.NotFound(nameof(CollegeAdmin), request.Id));

            admin.ToggleStatus();
            admins.Update(admin);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new CollegeAdminDto(
                admin.Id, admin.Code, admin.FullName, admin.FacultyId, admin.Faculty?.Name ?? string.Empty, admin.Email, admin.Status.ToString()));
        }
    }
}
