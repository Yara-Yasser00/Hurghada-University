using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;
using MediatR;

namespace HurghadaUniversity.Application.Features.Faculties
{
    public sealed record UpdateFacultyCommand(
        Guid Id,
        string Name,
        string ArabicName,
        string Dean,
        int DepartmentCount,
        int StudentCount,
        string? Description = null,
        string? ImageUrl = null,
        string? Slug = null)
        : IRequest<Result<FacultyDto>>;

    public sealed class UpdateFacultyCommandHandler(IFacultyRepository faculties, IUnitOfWork unitOfWork)
        : IRequestHandler<UpdateFacultyCommand, Result<FacultyDto>>
    {
        public async Task<Result<FacultyDto>> Handle(UpdateFacultyCommand request, CancellationToken cancellationToken)
        {
            var faculty = await faculties.GetByIdAsync(request.Id, cancellationToken);
            if (faculty is null)
                return Result.Failure<FacultyDto>(Error.NotFound(nameof(Faculty), request.Id));

            faculty.Update(
                request.Name, request.ArabicName, request.Dean, request.DepartmentCount, request.StudentCount,
                request.Description, request.ImageUrl, request.Slug);
            faculties.Update(faculty);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetFacultiesQueryHandler.Map(faculty));
        }
    }

    public sealed record DeleteFacultyCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteFacultyCommandHandler(IFacultyRepository faculties, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteFacultyCommand, Result>
    {
        public async Task<Result> Handle(DeleteFacultyCommand request, CancellationToken cancellationToken)
        {
            var faculty = await faculties.GetByIdAsync(request.Id, cancellationToken);
            if (faculty is null)
                return Result.Failure(Error.NotFound(nameof(Faculty), request.Id));

            faculties.Remove(faculty);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Departments
{
    public sealed record UpdateDepartmentCommand(Guid Id, string Name, string Head, int Programs, RecordStatus Status)
        : IRequest<Result<DepartmentDto>>;

    public sealed class UpdateDepartmentCommandHandler(IDepartmentRepository departments, IUnitOfWork unitOfWork)
        : IRequestHandler<UpdateDepartmentCommand, Result<DepartmentDto>>
    {
        public async Task<Result<DepartmentDto>> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
        {
            var dept = await departments.GetByIdAsync(request.Id, cancellationToken);
            if (dept is null)
                return Result.Failure<DepartmentDto>(Error.NotFound(nameof(Department), request.Id));

            dept.Update(request.Name, request.Head, request.Programs, request.Status);
            departments.Update(dept);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new DepartmentDto(
                dept.Id, dept.Code, dept.Name, dept.FacultyId, dept.Faculty?.Name ?? string.Empty,
                dept.Head, dept.Programs, dept.Status.ToString()));
        }
    }

    public sealed record DeleteDepartmentCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteDepartmentCommandHandler(IDepartmentRepository departments, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteDepartmentCommand, Result>
    {
        public async Task<Result> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
        {
            var dept = await departments.GetByIdAsync(request.Id, cancellationToken);
            if (dept is null)
                return Result.Failure(Error.NotFound(nameof(Department), request.Id));

            departments.Remove(dept);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Staff
{
    public sealed record UpdateStaffCommand(
        Guid Id,
        string FullName,
        string RoleTitle,
        string DepartmentName,
        ContractType Contract,
        int SinceYear) : IRequest<Result<StaffDto>>;

    public sealed class UpdateStaffCommandHandler(IStaffRepository staff, IUnitOfWork unitOfWork)
        : IRequestHandler<UpdateStaffCommand, Result<StaffDto>>
    {
        public async Task<Result<StaffDto>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
        {
            var member = await staff.GetByIdAsync(request.Id, cancellationToken);
            if (member is null)
                return Result.Failure<StaffDto>(Error.NotFound(nameof(StaffMember), request.Id));

            member.Update(request.FullName, request.RoleTitle, request.DepartmentName, request.Contract, request.SinceYear);
            staff.Update(member);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new StaffDto(
                member.Id, member.StaffCode, member.FullName, member.RoleTitle,
                member.DepartmentName, member.Contract.ToString(), member.SinceYear));
        }
    }

    public sealed record DeleteStaffCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteStaffCommandHandler(IStaffRepository staff, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteStaffCommand, Result>
    {
        public async Task<Result> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
        {
            var member = await staff.GetByIdAsync(request.Id, cancellationToken);
            if (member is null)
                return Result.Failure(Error.NotFound(nameof(StaffMember), request.Id));

            staff.Remove(member);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.CollegeAdmins
{
    public sealed record UpdateCollegeAdminCommand(Guid Id, string FullName, Guid FacultyId, string Email)
        : IRequest<Result<CollegeAdminDto>>;

    public sealed class UpdateCollegeAdminCommandHandler(
        ICollegeAdminRepository admins,
        IFacultyRepository faculties,
        IUnitOfWork unitOfWork) : IRequestHandler<UpdateCollegeAdminCommand, Result<CollegeAdminDto>>
    {
        public async Task<Result<CollegeAdminDto>> Handle(UpdateCollegeAdminCommand request, CancellationToken cancellationToken)
        {
            var admin = await admins.GetByIdAsync(request.Id, cancellationToken);
            if (admin is null)
                return Result.Failure<CollegeAdminDto>(Error.NotFound(nameof(CollegeAdmin), request.Id));

            var faculty = await faculties.GetByIdAsync(request.FacultyId, cancellationToken);
            if (faculty is null)
                return Result.Failure<CollegeAdminDto>(Error.NotFound(nameof(Faculty), request.FacultyId));

            admin.Update(request.FullName, request.FacultyId, request.Email);
            admins.Update(admin);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new CollegeAdminDto(
                admin.Id, admin.Code, admin.FullName, admin.FacultyId, faculty.Name, admin.Email, admin.Status.ToString()));
        }
    }

    public sealed record DeleteCollegeAdminCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteCollegeAdminCommandHandler(ICollegeAdminRepository admins, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteCollegeAdminCommand, Result>
    {
        public async Task<Result> Handle(DeleteCollegeAdminCommand request, CancellationToken cancellationToken)
        {
            var admin = await admins.GetByIdAsync(request.Id, cancellationToken);
            if (admin is null)
                return Result.Failure(Error.NotFound(nameof(CollegeAdmin), request.Id));

            admins.Remove(admin);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Students
{
    public sealed record DeleteStudentCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteStudentCommandHandler(IStudentRepository students, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteStudentCommand, Result>
    {
        public async Task<Result> Handle(DeleteStudentCommand request, CancellationToken cancellationToken)
        {
            var student = await students.GetByIdAsync(request.Id, cancellationToken);
            if (student is null)
                return Result.Failure(Error.NotFound(nameof(Student), request.Id));

            students.Remove(student);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
