using Vapless.Domain.Entities;

namespace Vapless.Domain.Interfaces;

public interface ICalculatorStrategy<in TInput, out TResult>
{
    TResult Calculate(TInput input);
}

public sealed record SavingsInput(UserProgress Progress, DateTime AsOf);

public sealed record SavingsSnapshot(int DaysClean, decimal CopSaved, decimal NicotineAvoidedMg);
