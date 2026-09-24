using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using MediatR;

namespace HurghadaUniversity.Application.Features.Announcements
{
    public sealed record GetAnnouncementsQuery : IRequest<Result<IReadOnlyList<AnnouncementDto>>>;

    public sealed class GetAnnouncementsQueryHandler(IAnnouncementRepository announcements)
        : IRequestHandler<GetAnnouncementsQuery, Result<IReadOnlyList<AnnouncementDto>>>
    {
        public async Task<Result<IReadOnlyList<AnnouncementDto>>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
        {
            var list = await announcements.ListAsync(cancellationToken);
            return Result.Success<IReadOnlyList<AnnouncementDto>>(list
                .OrderByDescending(a => a.PublishedOn)
                .Select(a => new AnnouncementDto(a.Id, a.Title, a.Body, a.Audience, a.PublishedOn))
                .ToList());
        }
    }

    public sealed record CreateAnnouncementCommand(string Title, string Body, string Audience, DateOnly PublishedOn)
        : IRequest<Result<AnnouncementDto>>;

    public sealed class CreateAnnouncementCommandHandler(IAnnouncementRepository announcements, IUnitOfWork unitOfWork)
        : IRequestHandler<CreateAnnouncementCommand, Result<AnnouncementDto>>
    {
        public async Task<Result<AnnouncementDto>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var entity = Announcement.Create(request.Title, request.Body, request.Audience, request.PublishedOn);
            await announcements.AddAsync(entity, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new AnnouncementDto(entity.Id, entity.Title, entity.Body, entity.Audience, entity.PublishedOn));
        }
    }

    public sealed record UpdateAnnouncementCommand(Guid Id, string Title, string Body, string Audience, DateOnly PublishedOn)
        : IRequest<Result<AnnouncementDto>>;

    public sealed class UpdateAnnouncementCommandHandler(IAnnouncementRepository announcements, IUnitOfWork unitOfWork)
        : IRequestHandler<UpdateAnnouncementCommand, Result<AnnouncementDto>>
    {
        public async Task<Result<AnnouncementDto>> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var entity = await announcements.GetByIdAsync(request.Id, cancellationToken);
            if (entity is null)
                return Result.Failure<AnnouncementDto>(Error.NotFound(nameof(Announcement), request.Id));

            entity.Update(request.Title, request.Body, request.Audience, request.PublishedOn);
            announcements.Update(entity);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new AnnouncementDto(entity.Id, entity.Title, entity.Body, entity.Audience, entity.PublishedOn));
        }
    }

    public sealed record DeleteAnnouncementCommand(Guid Id) : IRequest<Result>;

    public sealed class DeleteAnnouncementCommandHandler(IAnnouncementRepository announcements, IUnitOfWork unitOfWork)
        : IRequestHandler<DeleteAnnouncementCommand, Result>
    {
        public async Task<Result> Handle(DeleteAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var entity = await announcements.GetByIdAsync(request.Id, cancellationToken);
            if (entity is null)
                return Result.Failure(Error.NotFound(nameof(Announcement), request.Id));

            announcements.Remove(entity);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Notifications
{
    public sealed record GetNotificationsQuery(Guid? UserId) : IRequest<Result<IReadOnlyList<NotificationDto>>>;

    public sealed class GetNotificationsQueryHandler(INotificationRepository notifications)
        : IRequestHandler<GetNotificationsQuery, Result<IReadOnlyList<NotificationDto>>>
    {
        public async Task<Result<IReadOnlyList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            var list = await notifications.GetForUserAsync(request.UserId, cancellationToken);
            return Result.Success<IReadOnlyList<NotificationDto>>(list.Select(n =>
                new NotificationDto(n.Id, n.Title, n.Body, n.Href, n.IsRead, n.CreatedAtUtc)).ToList());
        }
    }

    public sealed record MarkNotificationReadCommand(Guid Id) : IRequest<Result>;

    public sealed class MarkNotificationReadCommandHandler(INotificationRepository notifications, IUnitOfWork unitOfWork)
        : IRequestHandler<MarkNotificationReadCommand, Result>
    {
        public async Task<Result> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
        {
            var item = await notifications.GetByIdAsync(request.Id, cancellationToken);
            if (item is null)
                return Result.Failure(Error.NotFound(nameof(Notification), request.Id));

            item.MarkRead();
            notifications.Update(item);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }

    public sealed record MarkAllNotificationsReadCommand(Guid? UserId) : IRequest<Result>;

    public sealed class MarkAllNotificationsReadCommandHandler(INotificationRepository notifications, IUnitOfWork unitOfWork)
        : IRequestHandler<MarkAllNotificationsReadCommand, Result>
    {
        public async Task<Result> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
        {
            var list = await notifications.GetForUserAsync(request.UserId, cancellationToken);
            foreach (var item in list.Where(n => !n.IsRead))
            {
                item.MarkRead();
                notifications.Update(item);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}

namespace HurghadaUniversity.Application.Features.Fees
{
    public sealed record GetStudentFeesQuery(Guid StudentId) : IRequest<Result<FeeAccountDto>>;

    public sealed class GetStudentFeesQueryHandler(IFeeAccountRepository fees)
        : IRequestHandler<GetStudentFeesQuery, Result<FeeAccountDto>>
    {
        public async Task<Result<FeeAccountDto>> Handle(GetStudentFeesQuery request, CancellationToken cancellationToken)
        {
            var account = await fees.GetByStudentAsync(request.StudentId, cancellationToken);
            if (account is null)
                return Result.Failure<FeeAccountDto>(Error.NotFound(nameof(FeeAccount), request.StudentId));

            return Result.Success(new FeeAccountDto(
                account.Id, account.StudentId, account.Semester, account.TuitionAmount,
                account.PaidAmount, account.Balance, account.DueDate, account.Status.ToString()));
        }
    }

    public sealed record PayFeesCommand(Guid StudentId, decimal Amount) : IRequest<Result<FeeAccountDto>>;

    public sealed class PayFeesCommandHandler(IFeeAccountRepository fees, IUnitOfWork unitOfWork)
        : IRequestHandler<PayFeesCommand, Result<FeeAccountDto>>
    {
        public async Task<Result<FeeAccountDto>> Handle(PayFeesCommand request, CancellationToken cancellationToken)
        {
            var account = await fees.GetByStudentAsync(request.StudentId, cancellationToken);
            if (account is null)
                return Result.Failure<FeeAccountDto>(Error.NotFound(nameof(FeeAccount), request.StudentId));

            try
            {
                account.RecordPayment(request.Amount);
            }
            catch (Domain.Exceptions.DomainException ex)
            {
                return Result.Failure<FeeAccountDto>(Error.Validation(ex.Message));
            }

            fees.Update(account);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(new FeeAccountDto(
                account.Id, account.StudentId, account.Semester, account.TuitionAmount,
                account.PaidAmount, account.Balance, account.DueDate, account.Status.ToString()));
        }
    }
}

namespace HurghadaUniversity.Application.Features.Dashboards
{
    public sealed record GetAdminDashboardQuery : IRequest<Result<DashboardStatsDto>>;

    public sealed class GetAdminDashboardQueryHandler(
        IStudentRepository students,
        IStaffRepository staff,
        ICourseRepository courses,
        IFacultyRepository faculties) : IRequestHandler<GetAdminDashboardQuery, Result<DashboardStatsDto>>
    {
        public async Task<Result<DashboardStatsDto>> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
        {
            var studentCount = (await students.ListAsync(cancellationToken)).Count;
            var staffCount = (await staff.ListAsync(cancellationToken)).Count;
            var courseList = await courses.ListAsync(cancellationToken);
            var activeCourses = courseList.Count(c => c.IsEnabled);
            var facultyCount = (await faculties.ListAsync(cancellationToken)).Count;
            var enrollmentRate = courseList.Count == 0
                ? 0
                : Math.Round((decimal)courseList.Sum(c => c.EnrolledCount) / Math.Max(1, courseList.Sum(c => Math.Max(c.EnrolledCount, 40))) * 100, 1);

            return Result.Success(new DashboardStatsDto(studentCount, staffCount, activeCourses, facultyCount, enrollmentRate));
        }
    }
}
