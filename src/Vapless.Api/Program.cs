using Microsoft.Extensions.FileProviders;
using Vapless.Api.Middlewares;
using Vapless.Application;
using Vapless.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("local", policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("local");

var clientPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "Vapless.Client"));
if (Directory.Exists(clientPath))
{
    var provider = new PhysicalFileProvider(clientPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = provider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = provider });
}
else
{
    app.Logger.LogWarning("No se encontró la carpeta Vapless.Client en {Path}", clientPath);
}

app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    app = "vapless.",
    slogan = "Menos vape. Más vida.",
    tier = "Crack the Code 2026"
}));

await app.Services.InitializeDatabaseAsync();

app.Run();
