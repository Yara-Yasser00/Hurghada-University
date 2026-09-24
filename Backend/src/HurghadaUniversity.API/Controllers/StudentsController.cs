using HurghadaUniversity.Application.Features.Students;
using HurghadaUniversity.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[Authorize]
public sealed class StudentsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetStudentsQuery(search), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetStudentByIdQuery(id), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateStudentCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStudentBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateStudentCommand(id, body.FullName, body.FacultyId, body.Level, body.Gpa, body.Status), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteStudentCommand(id), cancellationToken));

    public sealed record UpdateStudentBody(string FullName, Guid FacultyId, string Level, decimal Gpa, RecordStatus Status);
}
