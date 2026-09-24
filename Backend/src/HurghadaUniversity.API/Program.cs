using HurghadaUniversity.Application;
using HurghadaUniversity.Infrastructure;
using HurghadaUniversity.Infrastructure.Persistence.Seed;
using HurghadaUniversity.API.Middleware;
using HurghadaUniversity.Infrastructure.Storage;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using HurghadaUniversity.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hurghada University API",
        Version = "v1",
        Description = "Clean Architecture ASP.NET Core Web API for Hurghada University Management System"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: Bearer {token}",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202",
        "https://localhost:4200",
        "http://localhost:5142",
        "https://localhost:7019"
    ];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

var app = builder.Build();

await DbSeeder.SeedAsync(app.Services);

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseCors("Frontend");

var mediaOpts = app.Services.GetRequiredService<IOptions<MediaOptions>>().Value;
var uploadsRoot = Path.IsPathRooted(mediaOpts.RootPath)
    ? mediaOpts.RootPath
    : Path.Combine(app.Environment.ContentRootPath, mediaOpts.RootPath);
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads"
});

// Same-origin hosting:
//   /        → public site (aurelia)
//   /app     → dashboard SPA
//   /api     → controllers
//   /uploads → media
var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(wwwroot);
var dashboardRoot = Path.Combine(wwwroot, "app");
Directory.CreateDirectory(dashboardRoot);

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(dashboardRoot),
    RequestPath = "/app"
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(dashboardRoot),
    RequestPath = "/app"
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResultStatusCodes =
    {
        [HealthStatus.Healthy] = StatusCodes.Status200OK,
        [HealthStatus.Degraded] = StatusCodes.Status200OK,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
    }
});

var siteIndex = Path.Combine(wwwroot, "index.html");
var appIndex = Path.Combine(dashboardRoot, "index.html");

if (File.Exists(appIndex))
{
    app.MapFallbackToFile("/app/{*path:nonfile}", "app/index.html");
}

if (File.Exists(siteIndex))
{
    app.MapFallbackToFile("{*path:nonfile}", "index.html");
}

app.Run();

public partial class Program;
