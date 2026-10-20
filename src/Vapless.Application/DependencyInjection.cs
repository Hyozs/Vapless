using Microsoft.Extensions.DependencyInjection;
using Vapless.Application.Calculators;
using Vapless.Application.Events;
using Vapless.Application.Factories;
using Vapless.Application.Interfaces;
using Vapless.Application.RiskRules;
using Vapless.Application.Services;
using Vapless.Application.Strategies;
using Vapless.Domain.Interfaces;

namespace Vapless.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<ISavingsCalculator, SavingsCalculator>();
        services.AddSingleton<ISavingsComparisonCatalog, SavingsComparisonCatalog>();
        services.AddSingleton<ICravingInterventionFactory, CravingInterventionFactory>();
        services.AddSingleton<ISwipeEvaluationStrategy, SwipeEvaluationStrategy>();

        services.AddScoped<ICravingObserver, StreakObserver>();
        services.AddScoped<ICravingObserver, SavingsInsightObserver>();
        services.AddScoped<ICravingObserver, TriggerCoachObserver>();
        services.AddScoped<ICravingEventPublisher, CravingEventPublisher>();

        services.AddScoped<IRiskRule, FrequencyRiskRule>();
        services.AddScoped<IRiskRule, NicotineConcentrationRule>();
        services.AddScoped<IRiskRule, EarlyAgeRiskRule>();
        services.AddScoped<IRiskRule, FamilyContextRiskRule>();
        services.AddScoped<IRiskRule, EmotionalTriggerRiskRule>();
        services.AddScoped<IRiskRule, SchoolUseRiskRule>();

        services.AddScoped<IAssertiveStrategy, HumorResponseStrategy>();
        services.AddScoped<IAssertiveStrategy, DirectAssertiveStrategy>();
        services.AddScoped<IAssertiveStrategy, AlternativeResponseStrategy>();

        services.AddScoped<ICravingService, CravingService>();
        services.AddScoped<ISavingsService, SavingsService>();
        services.AddScoped<IComunaPulseService, ComunaPulseService>();
        services.AddScoped<IPsychoSocialAnalysisService, PsychoSocialAnalysisService>();
        services.AddScoped<IHackService, HackService>();
        services.AddScoped<IDojoService, DojoService>();
        services.AddScoped<ISupportService, SupportService>();
        services.AddScoped<ISchoolAirService, SchoolAirService>();
        services.AddScoped<IProfileService, ProfileService>();

        return services;
    }
}
