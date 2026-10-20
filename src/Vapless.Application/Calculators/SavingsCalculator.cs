using Vapless.Domain.Entities;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Calculators;

public sealed class SavingsCalculator : ISavingsCalculator, ICalculatorStrategy<SavingsInput, SavingsSnapshot>
{
    public int DaysClean(UserProgress progress, DateTime asOf)
    {
        var days = (asOf.Date - progress.QuitDate.Date).Days;
        return days < 0 ? 0 : days;
    }

    public decimal CopSaved(UserProgress progress, DateTime asOf) =>
        DaysClean(progress, asOf) * progress.DailyCostCop;

    public decimal NicotineAvoidedMg(UserProgress progress, DateTime asOf) =>
        Math.Round(DaysClean(progress, asOf) * progress.NicotineMgPerDay, 1);

    public SavingsSnapshot Snapshot(UserProgress progress, DateTime asOf) =>
        new(
            DaysClean(progress, asOf),
            CopSaved(progress, asOf),
            NicotineAvoidedMg(progress, asOf));

    public SavingsSnapshot Calculate(SavingsInput input) => Snapshot(input.Progress, input.AsOf);
}
