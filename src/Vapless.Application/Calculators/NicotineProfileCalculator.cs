using Vapless.Domain.Interfaces;

namespace Vapless.Application.Calculators;

public sealed class NicotineProfileCalculator : ICalculatorStrategy<PodProfileInput, NicotineProfileSnapshot>
{
    public NicotineProfileSnapshot Calculate(PodProfileInput input)
    {
        var progress = input.Progress;
        var asOf = input.AsOf;
        var profile = progress.PodProfile;

        var days = (asOf.Date - progress.QuitDate.Date).Days;
        if (days < 0)
        {
            days = 0;
        }

        var weeks = days / 7m;
        var weeklyNicotine = progress.NicotineMgPerWeek;
        var dailyNicotine = progress.NicotineMgPerDay;
        var weeklyCigarettes = progress.CigarettesEquivalentPerWeek;
        var ingested = progress.NicotineIngestedMg(asOf);
        var avoided = Math.Round(weeks * weeklyNicotine, 1);
        var cigarettesAvoided = Math.Round(weeks * weeklyCigarettes, 1);
        var weeklyCost = progress.WeeklyCostCop;
        var copSaved = progress.CopSaved(asOf);

        var phrase = profile.Device == Domain.Enums.DeviceType.NoUsa
            ? "Sin pods registrados: la referencia de nicotina y ahorro queda en cero."
            : $"{profile.NicotineRange} por {profile.Name.ToLowerInvariant()}: {weeklyNicotine:0.#} mg a la semana " +
              $"({dailyNicotine:0.#} mg al día), equivalente a {weeklyCigarettes:0.#} cigarrillos por semana. " +
              $"Hoy tu cuerpo lleva {avoided:0.#} mg menos y {copSaved:N0} COP menos de vapeo.";

        return new NicotineProfileSnapshot(
            (int)profile.Device,
            profile.Name,
            profile.NicotineMgPerPod,
            profile.CigarettesEquivalentPerPod,
            profile.EstimatedCostCop,
            progress.PodsPerWeek,
            weeklyNicotine,
            dailyNicotine,
            weeklyCigarettes,
            ingested,
            avoided,
            cigarettesAvoided,
            weeklyCost,
            copSaved,
            phrase);
    }
}
