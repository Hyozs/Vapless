using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vapless.Application.Interfaces;
using Vapless.Domain.Interfaces;
using Vapless.Infrastructure.AirQuality;
using Vapless.Infrastructure.Data;
using Vapless.Infrastructure.Repositories;
using Vapless.Infrastructure.Security;

namespace Vapless.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("VaplessDb") ?? "Data Source=vapless.db";

        services.AddDbContext<VaplessDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<ICravingRepository, CravingRepository>();
        services.AddScoped<ISurveyRepository, SurveyRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IHackCardRepository, HackCardRepository>();
        services.AddScoped<ISocialScenarioRepository, SocialScenarioRepository>();
        services.AddScoped<ISupportHotlineRepository, SupportHotlineRepository>();
        services.AddScoped<ISchoolAirRepository, SchoolAirRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IKAnonymityEvaluator, KAnonymityEvaluator>();
        services.AddSingleton<ISchoolAirGenerator, SchoolAirSimulator>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<VaplessDbContext>();
        await db.Database.EnsureCreatedAsync(ct);
        await DbSeeder.SeedAsync(db, ct);
    }
}
