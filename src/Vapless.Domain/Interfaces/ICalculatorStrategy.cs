using Vapless.Domain.Entities;

namespace Vapless.Domain.Interfaces;

public interface ICalculatorStrategy<in TInput, out TResult>
{
    TResult Calculate(TInput input);
}

public sealed record SavingsInput(UserProgress Progress, DateTime AsOf);

public sealed record SavingsSnapshot(int DaysClean, decimal CopSaved, decimal NicotineAvoidedMg);

public sealed record PodProfileInput(UserProgress Progress, DateTime AsOf);

public sealed record NicotineProfileSnapshot(
    int PodType,
    string PodTypeName,
    decimal NicotineMgPerPod,
    decimal CigarettesPerPod,
    decimal PodCostCop,
    int PodsPerWeek,
    decimal WeeklyNicotineMg,
    decimal DailyNicotineMg,
    decimal WeeklyCigarettes,
    decimal NicotineIngestedMg,
    decimal NicotineAvoidedMg,
    decimal CigarettesAvoided,
    decimal WeeklyCostCop,
    decimal CopSaved,
    string Phrase);
