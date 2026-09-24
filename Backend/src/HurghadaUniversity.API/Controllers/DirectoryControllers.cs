using HurghadaUniversity.Application.Features.CollegeAdmins;
using HurghadaUniversity.Application.Features.Courses;
using HurghadaUniversity.Application.Features.Departments;
using HurghadaUniversity.Application.Features.Faculties;
using HurghadaUniversity.Application.Features.Staff;
using HurghadaUniversity.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[Authorize]
public sealed class FacultiesController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetFacultiesQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateFacultyCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFacultyBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateFacultyCommand(
            id, body.Name, body.ArabicName, body.Dean, body.DepartmentCount, body.StudentCount,
            body.Description, body.ImageUrl, body.Slug), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteFacultyCommand(id), cancellationToken));

    [HttpPost("{id:guid}/toggle")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new ToggleFacultyCommand(id), cancellationToken));

    public sealed record UpdateFacultyBody(
        string Name,
        string ArabicName,
        string Dean,
        int DepartmentCount,
        int StudentCount,
        string? Description = null,
        string? ImageUrl = null,
        string? Slug = null);
}

[Authorize]
public sealed class DepartmentsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetDepartmentsQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateDepartmentCommand(id, body.Name, body.Head, body.Programs, body.Status), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteDepartmentCommand(id), cancellationToken));

    public sealed record UpdateDepartmentBody(string Name, string Head, int Programs, RecordStatus Status);
}

[Authorize]
public sealed class StaffController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetStaffQuery(search), cancellationToken));

    [HttpPost]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Hr)}")]
    public async Task<IActionResult> Create([FromBody] CreateStaffCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Hr)}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateStaffCommand(id, body.FullName, body.RoleTitle, body.DepartmentName, body.Contract, body.SinceYear), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Hr)}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteStaffCommand(id), cancellationToken));

    public sealed record UpdateStaffBody(string FullName, string RoleTitle, string DepartmentName, ContractType Contract, int SinceYear);
}

[Authorize]
public sealed class CollegeAdminsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetCollegeAdminsQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateCollegeAdminCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollegeAdminBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateCollegeAdminCommand(id, body.FullName, body.FacultyId, body.Email), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteCollegeAdminCommand(id), cancellationToken));

    [HttpPost("{id:guid}/toggle")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new ToggleCollegeAdminCommand(id), cancellationToken));

    public sealed record UpdateCollegeAdminBody(string FullName, Guid FacultyId, string Email);
}

[Authorize]
public sealed class CoursesController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetCoursesQuery(search), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateCourseCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateCourseCommand(
            id, body.Name, body.ArabicName, body.InstructorName, body.Room, body.Credits, body.DepartmentName, body.ScheduleSlot), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteCourseCommand(id), cancellationToken));

    [HttpPost("{id:guid}/toggle")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new ToggleCourseCommand(id), cancellationToken));

    [HttpPost("register")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<IActionResult> Register([FromBody] RegisterCourseCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPost("drop")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<IActionResult> Drop([FromBody] DropCourseCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpGet("enrollments/{studentId:guid}")]
    public async Task<IActionResult> GetEnrollments(Guid studentId, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetStudentEnrollmentsQuery(studentId), cancellationToken));

    public sealed record UpdateCourseBody(
        string Name, string ArabicName, string InstructorName, string Room, int Credits, string DepartmentName, string? ScheduleSlot);
}
