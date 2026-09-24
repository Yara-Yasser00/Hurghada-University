using System.Security.Claims;
using HurghadaUniversity.Application.Features.Announcements;
using HurghadaUniversity.Application.Features.Attendance;
using HurghadaUniversity.Application.Features.Dashboards;
using HurghadaUniversity.Application.Features.Exams;
using HurghadaUniversity.Application.Features.Fees;
using HurghadaUniversity.Application.Features.Grades;
using HurghadaUniversity.Application.Features.Notifications;
using HurghadaUniversity.Application.Features.Registration;
using HurghadaUniversity.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[Authorize]
public sealed class ExamsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetExamsQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateExamCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExamBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateExamCommand(id, body.ExamDate, body.ExamTime, body.Venue, body.Seats, body.Status), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteExamCommand(id), cancellationToken));

    [HttpGet("{id:guid}/seats")]
    public async Task<IActionResult> GetSeats(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetExamSeatsQuery(id), cancellationToken));

    [HttpPost("{id:guid}/seats")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> AssignSeat(Guid id, [FromBody] AssignSeatBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new AssignExamSeatCommand(id, body.StudentId, body.SeatNumber), cancellationToken));

    public sealed record AssignSeatBody(Guid StudentId, string SeatNumber);
    public sealed record UpdateExamBody(DateOnly ExamDate, TimeOnly ExamTime, string Venue, int Seats, ExamStatus Status);
}

[Authorize]
public sealed class RegistrationController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetRegistrationWindowQuery(), cancellationToken));

    [HttpPut]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> SetOpen([FromBody] SetOpenBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new SetRegistrationOpenCommand(body.IsOpen), cancellationToken));

    public sealed record SetOpenBody(bool IsOpen);
}

[Authorize]
public sealed class GradesController(ISender sender) : ApiControllerBase
{
    [HttpGet("courses/{courseId:guid}")]
    public async Task<IActionResult> GetByCourse(Guid courseId, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetCourseGradesQuery(courseId), cancellationToken));

    [HttpPut]
    [Authorize(Roles = nameof(UserRole.Instructor))]
    public async Task<IActionResult> Upsert([FromBody] UpsertGradeCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPost("courses/{courseId:guid}/publish")]
    [Authorize(Roles = nameof(UserRole.Instructor))]
    public async Task<IActionResult> Publish(Guid courseId, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new PublishCourseGradesCommand(courseId), cancellationToken));
}

[Authorize(Roles = nameof(UserRole.Instructor))]
public sealed class AttendanceController(ISender sender) : ApiControllerBase
{
    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] CreateAttendanceSessionCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPost("sessions/{sessionId:guid}/mark")]
    public async Task<IActionResult> Mark(Guid sessionId, [FromBody] MarkBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new MarkAttendanceCommand(sessionId, body.StudentId, body.IsPresent), cancellationToken));

    [HttpPost("sessions/{sessionId:guid}/submit")]
    public async Task<IActionResult> Submit(Guid sessionId, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new SubmitAttendanceCommand(sessionId), cancellationToken));

    public sealed record MarkBody(Guid StudentId, bool IsPresent);
}

[Authorize]
public sealed class AnnouncementsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetAnnouncementsQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnnouncementBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateAnnouncementCommand(id, body.Title, body.Body, body.Audience, body.PublishedOn), cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteAnnouncementCommand(id), cancellationToken));

    public sealed record UpdateAnnouncementBody(string Title, string Body, string Audience, DateOnly PublishedOn);
}

[Authorize]
public sealed class NotificationsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        return FromResult(await sender.Send(new GetNotificationsQuery(userId), cancellationToken));
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new MarkNotificationReadCommand(id), cancellationToken));

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new MarkAllNotificationsReadCommand(GetUserId()), cancellationToken));

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}

[Authorize]
public sealed class FeesController(ISender sender) : ApiControllerBase
{
    [HttpGet("students/{studentId:guid}")]
    public async Task<IActionResult> Get(Guid studentId, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetStudentFeesQuery(studentId), cancellationToken));

    [HttpPost("students/{studentId:guid}/pay")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<IActionResult> Pay(Guid studentId, [FromBody] PayBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new PayFeesCommand(studentId, body.Amount), cancellationToken));

    public sealed record PayBody(decimal Amount);
}

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class DashboardsController(ISender sender) : ApiControllerBase
{
    [HttpGet("admin")]
    public async Task<IActionResult> Admin(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetAdminDashboardQuery(), cancellationToken));
}
