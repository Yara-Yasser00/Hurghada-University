using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Application.Features.Cms;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using MediatR;

namespace HurghadaUniversity.Application.Features.Public;

public sealed record PublicFacultyDto(
    Guid Id,
    string Slug,
    string Name,
    string ArabicName,
    string Dean,
    int DepartmentCount,
    int StudentCount,
    string Description,
    string ImageUrl);

public sealed record PublicSiteDto(
    int StudentCount,
    int StaffCount,
    int FacultyCount,
    int CourseCount,
    SiteProfileDto Profile,
    IReadOnlyList<PublicFacultyDto> Faculties,
    IReadOnlyList<AnnouncementDto> Announcements,
    IReadOnlyList<SiteNewsDto> News,
    IReadOnlyList<SiteEventDto> Events);

public sealed record GetPublicSiteQuery : IRequest<Result<PublicSiteDto>>;

public sealed class GetPublicSiteQueryHandler(
    IStudentRepository students,
    IStaffRepository staff,
    IFacultyRepository faculties,
    ICourseRepository courses,
    IAnnouncementRepository announcements,
    ISiteProfileRepository profiles,
    ISiteNewsRepository news,
    ISiteEventRepository events) : IRequestHandler<GetPublicSiteQuery, Result<PublicSiteDto>>
{
    public async Task<Result<PublicSiteDto>> Handle(GetPublicSiteQuery request, CancellationToken cancellationToken)
    {
        var facultyList = (await faculties.ListAsync(cancellationToken))
            .Where(f => f.IsEnabled)
            .OrderBy(f => f.ArabicName)
            .ToList();
        var announcementList = await announcements.ListAsync(cancellationToken);
        var studentCount = (await students.ListAsync(cancellationToken)).Count;
        var staffCount = (await staff.ListAsync(cancellationToken)).Count;
        var courseCount = (await courses.ListAsync(cancellationToken)).Count;

        var profile = await profiles.GetAsync(cancellationToken) ?? SiteProfile.CreateDefault();
        var newsList = (await news.ListAsync(cancellationToken))
            .Where(n => n.IsPublished)
            .OrderBy(n => n.SortOrder)
            .ThenByDescending(n => n.CreatedAtUtc)
            .ToList();
        var eventList = (await events.ListAsync(cancellationToken))
            .Where(e => e.IsPublished)
            .OrderBy(e => e.SortOrder)
            .ToList();

        return Result.Success(new PublicSiteDto(
            studentCount,
            staffCount,
            facultyList.Count,
            courseCount,
            GetSiteProfileQueryHandler.Map(profile),
            facultyList.Select(f => new PublicFacultyDto(
                f.Id,
                string.IsNullOrWhiteSpace(f.Slug) ? f.Id.ToString("N")[..8] : f.Slug,
                f.Name,
                f.ArabicName,
                f.Dean,
                f.DepartmentCount,
                f.StudentCount,
                f.Description,
                f.ImageUrl)).ToList(),
            announcementList
                .OrderByDescending(a => a.PublishedOn)
                .Take(8)
                .Select(a => new AnnouncementDto(a.Id, a.Title, a.Body, a.Audience, a.PublishedOn))
                .ToList(),
            newsList.Select(GetSiteNewsQueryHandler.Map).ToList(),
            eventList.Select(GetSiteEventsQueryHandler.Map).ToList()));
    }
}
