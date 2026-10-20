using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Events;

public sealed class StreakObserver : ICravingObserver
{
    public Task<IReadOnlyList<string>> OnCravingOvercameAsync(
        Craving log,
        UserProgress profile,
        CancellationToken ct = default)
    {
        var days = profile.DaysClean(DateTime.UtcNow);
        var messages = new List<string>
        {
            days == 0
                ? "Hoy sumaste un antojo superado. Ese ya es un logro."
                : $"LlevÃ¡s {days} dÃ­a(s) construyendo tu racha."
        };

        if (days > 0 && days % 7 == 0)
        {
            messages.Add($"Â¡Semana nueva! {days} dÃ­as de racha. TÃº mandÃ¡s.");
        }

        return Task.FromResult<IReadOnlyList<string>>(messages);
    }
}

public sealed class SavingsInsightObserver : ICravingObserver
{
    private readonly ISavingsCalculator _calculator;
    private readonly ISavingsComparisonCatalog _catalog;

    public SavingsInsightObserver(ISavingsCalculator calculator, ISavingsComparisonCatalog catalog)
    {
        _calculator = calculator;
        _catalog = catalog;
    }

    public Task<IReadOnlyList<string>> OnCravingOvercameAsync(
        Craving log,
        UserProgress profile,
        CancellationToken ct = default)
    {
        var cop = _calculator.CopSaved(profile, DateTime.UtcNow);
        return Task.FromResult<IReadOnlyList<string>>([_catalog.BuildPhrase(cop)]);
    }
}

public sealed class TriggerCoachObserver : ICravingObserver
{
    public Task<IReadOnlyList<string>> OnCravingOvercameAsync(
        Craving log,
        UserProgress profile,
        CancellationToken ct = default)
    {
        var message = log.Trigger switch
        {
            EmotionalTrigger.Familia =>
                "Si vuelve el impulso por algo de tu casa, entonces escribÃ­ lo que sentÃ­s y respirÃ¡ 4-7-8 antes de decidir.",
            EmotionalTrigger.Ansiedad =>
                "Si aparece la ansiedad, entonces hacÃ© 4 ciclos de respiraciÃ³n y tomÃ¡ agua antes de buscar el vape.",
            EmotionalTrigger.PresionSocial =>
                "Si el parche insiste, entonces usÃ¡ una salida corta: \"no, gracias\" y cambiÃ¡ de tema.",
            EmotionalTrigger.EstresAcademico =>
                "Si te agarra el estrÃ©s de parciales, entonces salÃ­ 3 minutos y caminÃ¡ antes de volver.",
            EmotionalTrigger.Aburrimiento =>
                "Si te agarra el aburrimiento, entonces elegÃ­ una tarea de 5 minutos que te mueva de lugar.",
            _ =>
                "Si te da curiosidad otra vez, entonces recordÃ¡ por quÃ© empezaste esta ruta."
        };

        return Task.FromResult<IReadOnlyList<string>>([message]);
    }
}

