using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Exceptions;

namespace HurghadaUniversity.Domain.Entities;

/// <summary>Singleton-style profile for the public university website.</summary>
public sealed class SiteProfile : AuditableEntity, IAggregateRoot
{
    public string BrandNameAr { get; private set; } = "جامعة الغردقة";
    public string BrandNameEn { get; private set; } = "Hurghada University";
    public string Tagline { get; private set; } = string.Empty;
    public string TaglineEn { get; private set; } = string.Empty;
    public string AboutIntro { get; private set; } = string.Empty;
    public string AboutIntroEn { get; private set; } = string.Empty;
    public string AddressLines { get; private set; } = string.Empty;
    public string AddressLinesEn { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Website { get; private set; } = string.Empty;
    public string HeroImageUrl { get; private set; } = "/assets/campus/hero.png";
    public string GlobalImageUrl { get; private set; } = "/assets/campus/life.png";
    public string PresidentName { get; private set; } = string.Empty;
    public string PresidentTitle { get; private set; } = "رئيس جامعة الغردقة";
    public string PresidentTitleEn { get; private set; } = "President of Hurghada University";

    private SiteProfile() { }

    public static SiteProfile CreateDefault()
        => new()
        {
            BrandNameAr = "جامعة الغردقة",
            BrandNameEn = "Hurghada University",
            Tagline = "نحو تميز أكاديمي يخدم البحر الأحمر ومصر",
            TaglineEn = "Towards academic excellence serving the Red Sea and Egypt",
            AboutIntro =
                "بدأت الدراسة بفرع الغردقة بكلية التربية عام 1995، ثم خُصصت 500 فدان للحرم، وصدر قرار إنشاء جامعة الغردقة رقم 3005 لسنة 2024.",
            AboutIntroEn =
                "Studies began at the Hurghada branch of the Faculty of Education in 1995. Later, 500 acres were allocated for the campus, and Presidential Decree No. 3005 of 2024 established Hurghada University.",
            AddressLines = "جامعة الغردقة\nشمال مدينة الغردقة\nمحافظة البحر الأحمر\nجمهورية مصر العربية",
            AddressLinesEn = "Hurghada University\nNorth of Hurghada City\nRed Sea Governorate\nArab Republic of Egypt",
            Phone = "+20 65 0000000",
            Email = "info@hurghada.edu.eg",
            Website = "http://www.hurghada.edu.eg/",
            HeroImageUrl = "/assets/campus/hero.png",
            GlobalImageUrl = "/assets/campus/life.png",
            PresidentName = "أ.د. محفوظ عبدالستار أبو الفضل إبراهيم",
            PresidentTitle = "رئيس جامعة الغردقة",
            PresidentTitleEn = "President of Hurghada University"
        };

    public void Update(
        string brandNameAr,
        string brandNameEn,
        string tagline,
        string taglineEn,
        string aboutIntro,
        string aboutIntroEn,
        string addressLines,
        string addressLinesEn,
        string phone,
        string email,
        string website,
        string heroImageUrl,
        string globalImageUrl,
        string presidentName,
        string presidentTitle,
        string presidentTitleEn)
    {
        BrandNameAr = brandNameAr.Trim();
        BrandNameEn = brandNameEn.Trim();
        Tagline = tagline.Trim();
        TaglineEn = taglineEn.Trim();
        AboutIntro = aboutIntro.Trim();
        AboutIntroEn = aboutIntroEn.Trim();
        AddressLines = addressLines.Trim();
        AddressLinesEn = addressLinesEn.Trim();
        Phone = phone.Trim();
        Email = email.Trim();
        Website = website.Trim();
        HeroImageUrl = string.IsNullOrWhiteSpace(heroImageUrl) ? HeroImageUrl : heroImageUrl.Trim();
        GlobalImageUrl = string.IsNullOrWhiteSpace(globalImageUrl) ? GlobalImageUrl : globalImageUrl.Trim();
        PresidentName = presidentName.Trim();
        PresidentTitle = presidentTitle.Trim();
        PresidentTitleEn = presidentTitleEn.Trim();
        MarkUpdated();
    }
}

public sealed class SiteNews : AuditableEntity, IAggregateRoot
{
    public string Category { get; private set; } = "أخبار";
    public string CategoryEn { get; private set; } = "News";
    public string Title { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string Summary { get; private set; } = string.Empty;
    public string SummaryEn { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public string PublishedLabel { get; private set; } = string.Empty;
    public bool IsFeatured { get; private set; }
    public bool IsPublished { get; private set; } = true;
    public int SortOrder { get; private set; }

    private SiteNews() { }

    public static SiteNews Create(
        string category,
        string categoryEn,
        string title,
        string titleEn,
        string summary,
        string summaryEn,
        string imageUrl,
        string publishedLabel,
        bool isFeatured = false,
        int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("SiteNews.TitleRequired", "News title is required.");

        return new SiteNews
        {
            Category = string.IsNullOrWhiteSpace(category) ? "أخبار" : category.Trim(),
            CategoryEn = string.IsNullOrWhiteSpace(categoryEn) ? "News" : categoryEn.Trim(),
            Title = title.Trim(),
            TitleEn = (titleEn ?? string.Empty).Trim(),
            Summary = summary.Trim(),
            SummaryEn = (summaryEn ?? string.Empty).Trim(),
            ImageUrl = (imageUrl ?? string.Empty).Trim(),
            PublishedLabel = string.IsNullOrWhiteSpace(publishedLabel) ? DateTime.UtcNow.Year.ToString() : publishedLabel.Trim(),
            IsFeatured = isFeatured,
            SortOrder = sortOrder,
            IsPublished = true
        };
    }

    public void Update(
        string category,
        string categoryEn,
        string title,
        string titleEn,
        string summary,
        string summaryEn,
        string imageUrl,
        string publishedLabel,
        bool isFeatured,
        bool isPublished,
        int sortOrder)
    {
        Category = category.Trim();
        CategoryEn = categoryEn.Trim();
        Title = title.Trim();
        TitleEn = titleEn.Trim();
        Summary = summary.Trim();
        SummaryEn = summaryEn.Trim();
        ImageUrl = imageUrl.Trim();
        PublishedLabel = publishedLabel.Trim();
        IsFeatured = isFeatured;
        IsPublished = isPublished;
        SortOrder = sortOrder;
        MarkUpdated();
    }
}

public sealed class SiteEvent : AuditableEntity, IAggregateRoot
{
    public string Day { get; private set; } = string.Empty;
    public string Month { get; private set; } = string.Empty;
    public string MonthEn { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string Location { get; private set; } = string.Empty;
    public string LocationEn { get; private set; } = string.Empty;
    public string Category { get; private set; } = "فعالية";
    public string CategoryEn { get; private set; } = "Event";
    public bool IsPublished { get; private set; } = true;
    public int SortOrder { get; private set; }

    private SiteEvent() { }

    public static SiteEvent Create(
        string day,
        string month,
        string monthEn,
        string title,
        string titleEn,
        string location,
        string locationEn,
        string category,
        string categoryEn,
        int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("SiteEvent.TitleRequired", "Event title is required.");

        return new SiteEvent
        {
            Day = day.Trim(),
            Month = month.Trim(),
            MonthEn = (monthEn ?? string.Empty).Trim(),
            Title = title.Trim(),
            TitleEn = (titleEn ?? string.Empty).Trim(),
            Location = location.Trim(),
            LocationEn = (locationEn ?? string.Empty).Trim(),
            Category = string.IsNullOrWhiteSpace(category) ? "فعالية" : category.Trim(),
            CategoryEn = string.IsNullOrWhiteSpace(categoryEn) ? "Event" : categoryEn.Trim(),
            SortOrder = sortOrder,
            IsPublished = true
        };
    }

    public void Update(
        string day,
        string month,
        string monthEn,
        string title,
        string titleEn,
        string location,
        string locationEn,
        string category,
        string categoryEn,
        bool isPublished,
        int sortOrder)
    {
        Day = day.Trim();
        Month = month.Trim();
        MonthEn = monthEn.Trim();
        Title = title.Trim();
        TitleEn = titleEn.Trim();
        Location = location.Trim();
        LocationEn = locationEn.Trim();
        Category = category.Trim();
        CategoryEn = categoryEn.Trim();
        IsPublished = isPublished;
        SortOrder = sortOrder;
        MarkUpdated();
    }
}
