using Vapless.Domain.Entities;

namespace Vapless.Domain.Interfaces;

public interface ISavingsCalculator
{
    int DaysClean(UserProgress progress, DateTime asOf);
    decimal CopSaved(UserProgress progress, DateTime asOf);
    decimal NicotineAvoidedMg(UserProgress progress, DateTime asOf);
    SavingsSnapshot Snapshot(UserProgress progress, DateTime asOf);
}

public interface ICravingObserver
{
    Task<IReadOnlyList<string>> OnCravingOvercameAsync(
        Craving craving,
        UserProgress progress,
        CancellationToken ct = default);
}

public interface ICravingEventPublisher
{
    Task<IReadOnlyList<string>> PublishAsync(
        Craving craving,
        UserProgress progress,
        CancellationToken ct = default);
}
