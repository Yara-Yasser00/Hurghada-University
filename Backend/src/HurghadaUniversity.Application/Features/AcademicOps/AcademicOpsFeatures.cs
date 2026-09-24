using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;
using MediatR;

namespace HurghadaUniversity.Application.Features.Exams
{
    public sealed record GetExamsQuery : IRequest<Result<IReadOnlyList<ExamDto>>>;

    public sealed class GetExamsQueryHandler(IExamRepository exams)
        : IRequestHandler<GetExamsQuery, Result<IReadOnlyList<ExamDto>>>
    {
        public async Task<Result<IReadOnlyList<ExamDto>>> Handle(GetExamsQuery request, CancellationToken cancellationToken)
        {
            var list = await exams.ListAsync(cancellationToken);
            return Result.Success<IReadOnlyList<ExamDto>>(list.Select(Map).ToList());
        }

        internal static ExamDto Map(Exam e) => new(
            e.Id, e.CourseId, e.CourseCode, e.CourseName, e.ExamDate, e.ExamTime, e.Venue, e.Seats, e.Status.ToString());
    }

    public sealed record CreateExamCommand(
        Guid CourseId,
        DateOnly ExamDate,
        TimeOnly ExamTime,
        string Venue,
        int Seats) : IRequest<Result<ExamDto>>;

    public sealed class CreateExamCommandValidator : AbstractValidator<CreateExamCommand>
    {
        public CreateExamCommandValidator()
        {
            RuleFor(x => x.CourseId).NotEmpty();
            RuleFor(x => x.Venue).NotEmpty();
            RuleFor(x => x.Seats).GreaterThan(0);
        }
    }

    public sealed class CreateExamCommandHandler(IExamRepository exams, ICourseRepository courses, IUnitOfWork unitOfWork)
        : IRequestHandler<CreateExamCommand, Result<ExamDto>>
    {
        public async Task<Result<ExamDto>> Handle(CreateExamCommand request, CancellationToken cancellationToken)
        {
            var course = await courses.GetByIdAsync(request.CourseId, cancellationToken);
            if (course is null)
                return Result.Failure<ExamDto>(Error.NotFound(nameof(Course), request.CourseId));

            var exam = Exam.Create(course.Id, course.Code, course.Name, request.ExamDate, request.ExamTime, request.Venue, request.Seats);
            await exams.AddAsync(exam, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetExamsQueryHandler.Map(exam));
        }
    }

    public sealed record GetExamSeatsQuery(Guid ExamId) : IRequest<Result<IReadOnlyList<ExamSeatDto>>>;

    public sealed class GetExamSeatsQueryHandler(IExamRepository exams)
        : IRequestHandler<GetExamSeatsQuery, Result<IReadOnlyList<ExamSeatDto>>>
    {
        public async Task<Result<IReadOnlyList<ExamSeatDto>>> Handle(GetExamSeatsQuery request, CancellationToken cancellationToken)
        {
            var exam = await exams.GetWithSeatsAsync(request.ExamId, cancellationToken);
            if (exam is null)
                return Result.Failure<IReadOnlyList<ExamSeatDto>>(Error.NotFound(nameof(Exam), request.ExamId));

            var seats = exam.SeatAssignments
                .Select(s => new ExamSeatDto(s.StudentId, s.Student?.FullName ?? string.Empty, s.Student?.UniversityId ?? string.Empty, s.SeatNumber))
                .ToList();
            return Result.Success<IReadOnlyList<ExamSeatDto>>(seats);
        }
    }

    public sealed record AssignExamSeatCommand(Guid ExamId, Guid StudentId, string SeatNumber) : IRequest<Result>;

    public sealed class AssignExamSeatCommandHandler(IExamRepository exams, IStudentRepository students, IUnitOfWork unitOfWork)
        : IRequestHandler<AssignExamSeatCommand, Result>
    {
        public async Task<Result> Handle(AssignExamSeatCommand request, CancellationToken cancellationToken)
        {
            var exam = await exams.GetWithSeatsAsync(request.ExamId, cancellationToken);
            if (exam is null)
                return Result.Failure(Error.NotFound(nameof(Exam), request.ExamId));
            if (await students.GetByIdAsync(request.StudentId, cancellationToken) is null)
                return Result.Failure(Error.NotFound(nameof(Student), request.StudentId));

            try
            {
                exam.AssignSeat(request.StudentId, request.SeatNumber);
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure(Error.Conflict(ex.Message));
            }

            exams.Update(exam);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }

    public sealed record UpdateExamCommand(
        Guid Id,
        DateOnly ExamDate,
        TimeOnly ExamTime,
        string Venue,
        int Seats,
        ExamStatus Status) : IRequest<Result<ExamDto>>;

    public sealed class UpdateExamCommandHandler(IExamRepository exams, IUnitOfWork unitOfWork)
        : IRequestHandler<UpdateExamCommand, Result<ExamDto>>
    {
        public async Task<Result<ExamDto>> Handle(UpdateExamCommand request, CancellationToken cancellationToken)
        {
            var exam = await exams.GetByIdAsync(request.Id, cancellationToken);
            if (exam is null)
                return Result.Failure<ExamDto>(Error.NotFound(nameof(Exam), request.Id));

            try
            {
                exam.Update(request.ExamDate, request.ExamTime, request.Venue, request.Seats, request.Status);
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure<ExamDto>(Error.Validation(ex.Message));
            }

            exams.Update(exam);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetExamsQueryHandler.Map(exam));
        }
    }

    public sealed record DeleteExamCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteExamCommandHandler(IExamRepository exams, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteExamCommand, Result>
    {
        public async Task<Result> Handle(DeleteExamCommand request, CancellationToken cancellationToken)
        {
            var exam = await exams.GetByIdAsync(request.Id, cancellationToken);
            if (exam is null)
                return Result.Failure(Error.NotFound(nameof(Exam), request.Id));

            exams.Remove(exam);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Registration
{
    public sealed record GetRegistrationWindowQuery : IRequest<Result<RegistrationWindowDto>>;
    public sealed record RegistrationWindowDto(Guid Id, string Semester, bool IsOpen, DateOnly ClosesOn, int CreditLimit);

    public sealed class GetRegistrationWindowQueryHandler(IRegistrationWindowRepository windows)
        : IRequestHandler<GetRegistrationWindowQuery, Result<RegistrationWindowDto>>
    {
        public async Task<Result<RegistrationWindowDto>> Handle(GetRegistrationWindowQuery request, CancellationToken cancellationToken)
        {
            var window = await windows.GetCurrentAsync(cancellationToken);
            if (window is null)
                return Result.Failure<RegistrationWindowDto>(Error.NotFound("RegistrationWindow", "current"));

            return Result.Success(new RegistrationWindowDto(window.Id, window.Semester, window.IsOpen, window.ClosesOn, window.CreditLimit));
        }
    }

    public sealed record SetRegistrationOpenCommand(bool IsOpen) : IRequest<Result<RegistrationWindowDto>>;

    public sealed class SetRegistrationOpenCommandHandler(IRegistrationWindowRepository windows, IUnitOfWork unitOfWork)
        : IRequestHandler<SetRegistrationOpenCommand, Result<RegistrationWindowDto>>
    {
        public async Task<Result<RegistrationWindowDto>> Handle(SetRegistrationOpenCommand request, CancellationToken cancellationToken)
        {
            var window = await windows.GetCurrentAsync(cancellationToken);
            if (window is null)
                return Result.Failure<RegistrationWindowDto>(Error.NotFound("RegistrationWindow", "current"));

            window.SetOpen(request.IsOpen);
            windows.Update(window);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new RegistrationWindowDto(window.Id, window.Semester, window.IsOpen, window.ClosesOn, window.CreditLimit));
        }
    }
}

namespace HurghadaUniversity.Application.Features.Grades
{
    public sealed record GetCourseGradesQuery(Guid CourseId) : IRequest<Result<IReadOnlyList<GradeDto>>>;

    public sealed class GetCourseGradesQueryHandler(IGradeRepository grades, ICourseRepository courses)
        : IRequestHandler<GetCourseGradesQuery, Result<IReadOnlyList<GradeDto>>>
    {
        public async Task<Result<IReadOnlyList<GradeDto>>> Handle(GetCourseGradesQuery request, CancellationToken cancellationToken)
        {
            var course = await courses.GetByIdAsync(request.CourseId, cancellationToken);
            if (course is null)
                return Result.Failure<IReadOnlyList<GradeDto>>(Error.NotFound(nameof(Course), request.CourseId));

            var list = await grades.GetByCourseAsync(request.CourseId, cancellationToken);
            return Result.Success<IReadOnlyList<GradeDto>>(list.Select(g => Map(g, course.Code)).ToList());
        }

        internal static GradeDto Map(GradeEntry g, string courseCode) => new(
            g.Id, g.CourseId, courseCode, g.StudentId, g.Student?.FullName ?? string.Empty,
            g.Midterm, g.Coursework, g.Final, g.Total, g.Letter, g.PublishStatus.ToString());
    }

    public sealed record UpsertGradeCommand(Guid CourseId, Guid StudentId, decimal Midterm, decimal Coursework, decimal Final)
        : IRequest<Result<GradeDto>>;

    public sealed class UpsertGradeCommandHandler(IGradeRepository grades, ICourseRepository courses, IUnitOfWork unitOfWork)
        : IRequestHandler<UpsertGradeCommand, Result<GradeDto>>
    {
        public async Task<Result<GradeDto>> Handle(UpsertGradeCommand request, CancellationToken cancellationToken)
        {
            var course = await courses.GetByIdAsync(request.CourseId, cancellationToken);
            if (course is null)
                return Result.Failure<GradeDto>(Error.NotFound(nameof(Course), request.CourseId));

            var existing = (await grades.GetByCourseAsync(request.CourseId, cancellationToken))
                .FirstOrDefault(g => g.StudentId == request.StudentId);

            try
            {
                if (existing is null)
                {
                    existing = GradeEntry.Create(request.CourseId, request.StudentId, request.Midterm, request.Coursework, request.Final);
                    await grades.AddAsync(existing, cancellationToken);
                }
                else
                {
                    existing.UpdateScores(request.Midterm, request.Coursework, request.Final);
                    grades.Update(existing);
                }
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure<GradeDto>(Error.Validation(ex.Message));
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(GetCourseGradesQueryHandler.Map(existing, course.Code));
        }
    }

    public sealed record PublishCourseGradesCommand(Guid CourseId) : IRequest<Result>;

    public sealed class PublishCourseGradesCommandHandler(IGradeRepository grades, IUnitOfWork unitOfWork)
        : IRequestHandler<PublishCourseGradesCommand, Result>
    {
        public async Task<Result> Handle(PublishCourseGradesCommand request, CancellationToken cancellationToken)
        {
            var list = await grades.GetByCourseAsync(request.CourseId, cancellationToken);
            foreach (var grade in list)
            {
                grade.Publish();
                grades.Update(grade);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Attendance
{
    public sealed record CreateAttendanceSessionCommand(Guid CourseId, DateOnly SessionDate) : IRequest<Result<Guid>>;

    public sealed class CreateAttendanceSessionCommandHandler(IAttendanceRepository attendance, ICourseRepository courses, IUnitOfWork unitOfWork)
        : IRequestHandler<CreateAttendanceSessionCommand, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(CreateAttendanceSessionCommand request, CancellationToken cancellationToken)
        {
            if (await courses.GetByIdAsync(request.CourseId, cancellationToken) is null)
                return Result.Failure<Guid>(Error.NotFound(nameof(Course), request.CourseId));

            var session = AttendanceSession.Create(request.CourseId, request.SessionDate);
            await attendance.AddAsync(session, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(session.Id);
        }
    }

    public sealed record MarkAttendanceCommand(Guid SessionId, Guid StudentId, bool IsPresent) : IRequest<Result>;

    public sealed class MarkAttendanceCommandHandler(IAttendanceRepository attendance, IUnitOfWork unitOfWork)
        : IRequestHandler<MarkAttendanceCommand, Result>
    {
        public async Task<Result> Handle(MarkAttendanceCommand request, CancellationToken cancellationToken)
        {
            var session = await attendance.GetWithRecordsAsync(request.SessionId, cancellationToken);
            if (session is null)
                return Result.Failure(Error.NotFound(nameof(AttendanceSession), request.SessionId));

            try
            {
                session.Mark(request.StudentId, request.IsPresent);
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure(Error.Conflict(ex.Message));
            }

            attendance.Update(session);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }

    public sealed record SubmitAttendanceCommand(Guid SessionId) : IRequest<Result>;

    public sealed class SubmitAttendanceCommandHandler(IAttendanceRepository attendance, IUnitOfWork unitOfWork)
        : IRequestHandler<SubmitAttendanceCommand, Result>
    {
        public async Task<Result> Handle(SubmitAttendanceCommand request, CancellationToken cancellationToken)
        {
            var session = await attendance.GetWithRecordsAsync(request.SessionId, cancellationToken);
            if (session is null)
                return Result.Failure(Error.NotFound(nameof(AttendanceSession), request.SessionId));

            session.Submit();
            attendance.Update(session);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
