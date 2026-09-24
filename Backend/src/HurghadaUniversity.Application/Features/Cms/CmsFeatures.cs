using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Entities;
using MediatR;

namespace HurghadaUniversity.Application.Features.Cms;

public sealed record SiteProfileDto(
    Guid Id,
    string BrandNameAr,
    string BrandNameEn,
    string Tagline,
    string TaglineEn,
    string AboutIntro,
    string AboutIntroEn,
    string AddressLines,
    string AddressLinesEn,
    string Phone,
    string Email,
    string Website,
    string HeroImageUrl,
    string GlobalImageUrl,
    string PresidentName,
    string PresidentTitle,
    string PresidentTitleEn);

public sealed record SiteNewsDto(
    Guid Id,
    string Category,
    string CategoryEn,
    string Title,
    string TitleEn,
    string Summary,
    string SummaryEn,
    string ImageUrl,
    string PublishedLabel,
    bool IsFeatured,
    bool IsPublished,
    int SortOrder);

public sealed record SiteEventDto(
    Guid Id,
    string Day,
    string Month,
    string MonthEn,
    string Title,
    string TitleEn,
    string Location,
    string LocationEn,
    string Category,
    string CategoryEn,
    bool IsPublished,
    int SortOrder);

public sealed record GetSiteProfileQuery : IRequest<Result<SiteProfileDto>>;

public sealed class GetSiteProfileQueryHandler(ISiteProfileRepository profiles)
    : IRequestHandler<GetSiteProfileQuery, Result<SiteProfileDto>>
{
    public async Task<Result<SiteProfileDto>> Handle(GetSiteProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await profiles.GetAsync(cancellationToken) ?? SiteProfile.CreateDefault();
        return Result.Success(Map(profile));
    }

    internal static SiteProfileDto Map(SiteProfile p) => new(
        p.Id, p.BrandNameAr, p.BrandNameEn, p.Tagline, p.TaglineEn, p.AboutIntro, p.AboutIntroEn,
        p.AddressLines, p.AddressLinesEn, p.Phone, p.Email, p.Website, p.HeroImageUrl, p.GlobalImageUrl,
        p.PresidentName, p.PresidentTitle, p.PresidentTitleEn);
}

public sealed record UpdateSiteProfileCommand(
    string BrandNameAr,
    string BrandNameEn,
    string Tagline,
    string TaglineEn,
    string AboutIntro,
    string AboutIntroEn,
    string AddressLines,
    string AddressLinesEn,
    string Phone,
    string Email,
    string Website,
    string HeroImageUrl,
    string GlobalImageUrl,
    string PresidentName,
    string PresidentTitle,
    string PresidentTitleEn) : IRequest<Result<SiteProfileDto>>;

public sealed class UpdateSiteProfileCommandValidator : AbstractValidator<UpdateSiteProfileCommand>
{
    public UpdateSiteProfileCommandValidator()
    {
        RuleFor(x => x.BrandNameAr).NotEmpty();
        RuleFor(x => x.BrandNameEn).NotEmpty();
    }
}

public sealed class UpdateSiteProfileCommandHandler(ISiteProfileRepository profiles, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSiteProfileCommand, Result<SiteProfileDto>>
{
    public async Task<Result<SiteProfileDto>> Handle(UpdateSiteProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await profiles.GetAsync(cancellationToken);
        if (profile is null)
        {
            profile = SiteProfile.CreateDefault();
            await profiles.AddAsync(profile, cancellationToken);
        }

        profile.Update(
            request.BrandNameAr, request.BrandNameEn, request.Tagline, request.TaglineEn,
            request.AboutIntro, request.AboutIntroEn, request.AddressLines, request.AddressLinesEn,
            request.Phone, request.Email, request.Website,
            request.HeroImageUrl, request.GlobalImageUrl, request.PresidentName,
            request.PresidentTitle, request.PresidentTitleEn);

        profiles.Update(profile);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetSiteProfileQueryHandler.Map(profile));
    }
}

public sealed record GetSiteNewsQuery : IRequest<Result<IReadOnlyList<SiteNewsDto>>>;

public sealed class GetSiteNewsQueryHandler(ISiteNewsRepository news)
    : IRequestHandler<GetSiteNewsQuery, Result<IReadOnlyList<SiteNewsDto>>>
{
    public async Task<Result<IReadOnlyList<SiteNewsDto>>> Handle(GetSiteNewsQuery request, CancellationToken cancellationToken)
    {
        var list = await news.ListAsync(cancellationToken);
        return Result.Success<IReadOnlyList<SiteNewsDto>>(list
            .OrderBy(n => n.SortOrder)
            .ThenByDescending(n => n.CreatedAtUtc)
            .Select(Map)
            .ToList());
    }

    internal static SiteNewsDto Map(SiteNews n) => new(
        n.Id, n.Category, n.CategoryEn, n.Title, n.TitleEn, n.Summary, n.SummaryEn,
        n.ImageUrl, n.PublishedLabel, n.IsFeatured, n.IsPublished, n.SortOrder);
}

public sealed record CreateSiteNewsCommand(
    string Category,
    string CategoryEn,
    string Title,
    string TitleEn,
    string Summary,
    string SummaryEn,
    string ImageUrl,
    string PublishedLabel,
    bool IsFeatured,
    int SortOrder) : IRequest<Result<SiteNewsDto>>;

public sealed class CreateSiteNewsCommandValidator : AbstractValidator<CreateSiteNewsCommand>
{
    public CreateSiteNewsCommandValidator() => RuleFor(x => x.Title).NotEmpty();
}

public sealed class CreateSiteNewsCommandHandler(ISiteNewsRepository news, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSiteNewsCommand, Result<SiteNewsDto>>
{
    public async Task<Result<SiteNewsDto>> Handle(CreateSiteNewsCommand request, CancellationToken cancellationToken)
    {
        var entity = SiteNews.Create(
            request.Category, request.CategoryEn, request.Title, request.TitleEn,
            request.Summary, request.SummaryEn, request.ImageUrl,
            request.PublishedLabel, request.IsFeatured, request.SortOrder);
        await news.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetSiteNewsQueryHandler.Map(entity));
    }
}

public sealed record UpdateSiteNewsCommand(
    Guid Id,
    string Category,
    string CategoryEn,
    string Title,
    string TitleEn,
    string Summary,
    string SummaryEn,
    string ImageUrl,
    string PublishedLabel,
    bool IsFeatured,
    bool IsPublished,
    int SortOrder) : IRequest<Result<SiteNewsDto>>;

public sealed class UpdateSiteNewsCommandHandler(ISiteNewsRepository news, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSiteNewsCommand, Result<SiteNewsDto>>
{
    public async Task<Result<SiteNewsDto>> Handle(UpdateSiteNewsCommand request, CancellationToken cancellationToken)
    {
        var entity = await news.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
            return Result.Failure<SiteNewsDto>(Error.NotFound(nameof(SiteNews), request.Id));

        entity.Update(
            request.Category, request.CategoryEn, request.Title, request.TitleEn,
            request.Summary, request.SummaryEn, request.ImageUrl,
            request.PublishedLabel, request.IsFeatured, request.IsPublished, request.SortOrder);
        news.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetSiteNewsQueryHandler.Map(entity));
    }
}

public sealed record DeleteSiteNewsCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteSiteNewsCommandHandler(ISiteNewsRepository news, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSiteNewsCommand, Result>
{
    public async Task<Result> Handle(DeleteSiteNewsCommand request, CancellationToken cancellationToken)
    {
        var entity = await news.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
            return Result.Failure(Error.NotFound(nameof(SiteNews), request.Id));

        news.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed record GetSiteEventsQuery : IRequest<Result<IReadOnlyList<SiteEventDto>>>;

public sealed class GetSiteEventsQueryHandler(ISiteEventRepository events)
    : IRequestHandler<GetSiteEventsQuery, Result<IReadOnlyList<SiteEventDto>>>
{
    public async Task<Result<IReadOnlyList<SiteEventDto>>> Handle(GetSiteEventsQuery request, CancellationToken cancellationToken)
    {
        var list = await events.ListAsync(cancellationToken);
        return Result.Success<IReadOnlyList<SiteEventDto>>(list
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.Month)
            .Select(Map)
            .ToList());
    }

    internal static SiteEventDto Map(SiteEvent e) => new(
        e.Id, e.Day, e.Month, e.MonthEn, e.Title, e.TitleEn, e.Location, e.LocationEn,
        e.Category, e.CategoryEn, e.IsPublished, e.SortOrder);
}

public sealed record CreateSiteEventCommand(
    string Day,
    string Month,
    string MonthEn,
    string Title,
    string TitleEn,
    string Location,
    string LocationEn,
    string Category,
    string CategoryEn,
    int SortOrder) : IRequest<Result<SiteEventDto>>;

public sealed class CreateSiteEventCommandValidator : AbstractValidator<CreateSiteEventCommand>
{
    public CreateSiteEventCommandValidator() => RuleFor(x => x.Title).NotEmpty();
}

public sealed class CreateSiteEventCommandHandler(ISiteEventRepository events, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSiteEventCommand, Result<SiteEventDto>>
{
    public async Task<Result<SiteEventDto>> Handle(CreateSiteEventCommand request, CancellationToken cancellationToken)
    {
        var entity = SiteEvent.Create(
            request.Day, request.Month, request.MonthEn, request.Title, request.TitleEn,
            request.Location, request.LocationEn, request.Category, request.CategoryEn, request.SortOrder);
        await events.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetSiteEventsQueryHandler.Map(entity));
    }
}

public sealed record UpdateSiteEventCommand(
    Guid Id,
    string Day,
    string Month,
    string MonthEn,
    string Title,
    string TitleEn,
    string Location,
    string LocationEn,
    string Category,
    string CategoryEn,
    bool IsPublished,
    int SortOrder) : IRequest<Result<SiteEventDto>>;

public sealed class UpdateSiteEventCommandHandler(ISiteEventRepository events, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSiteEventCommand, Result<SiteEventDto>>
{
    public async Task<Result<SiteEventDto>> Handle(UpdateSiteEventCommand request, CancellationToken cancellationToken)
    {
        var entity = await events.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
            return Result.Failure<SiteEventDto>(Error.NotFound(nameof(SiteEvent), request.Id));

        entity.Update(
            request.Day, request.Month, request.MonthEn, request.Title, request.TitleEn,
            request.Location, request.LocationEn, request.Category, request.CategoryEn,
            request.IsPublished, request.SortOrder);
        events.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(GetSiteEventsQueryHandler.Map(entity));
    }
}

public sealed record DeleteSiteEventCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteSiteEventCommandHandler(ISiteEventRepository events, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSiteEventCommand, Result>
{
    public async Task<Result> Handle(DeleteSiteEventCommand request, CancellationToken cancellationToken)
    {
        var entity = await events.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
            return Result.Failure(Error.NotFound(nameof(SiteEvent), request.Id));

        events.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
