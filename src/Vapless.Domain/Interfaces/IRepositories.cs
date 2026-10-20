using Vapless.Domain.Entities;

namespace Vapless.Domain.Interfaces;

public interface ICravingRepository
{
    Task AddAsync(Craving craving, CancellationToken ct = default);
    Task<IReadOnlyList<Craving>> ListByProgressAsync(int userProgressId, CancellationToken ct = default);
    Task<int> CountByProgressAsync(int userProgressId, CancellationToken ct = default);
}

public interface ISurveyRepository
{
    Task AddAsync(RiskSurvey survey, CancellationToken ct = default);
    Task<IReadOnlyList<RiskSurvey>> ListAsync(CancellationToken ct = default);
}

public interface IProfileRepository
{
    Task<UserProgress?> GetAsync(int id, CancellationToken ct = default);
    Task<UserProgress> GetOrCreateDefaultAsync(CancellationToken ct = default);
    Task AddAsync(UserProgress progress, CancellationToken ct = default);
}

public interface IHackCardRepository
{
    Task<IReadOnlyList<HackCard>> ListAsync(CancellationToken ct = default);
    Task<HackCard?> GetAsync(int id, CancellationToken ct = default);
}

public interface ISocialScenarioRepository
{
    Task<IReadOnlyList<SocialScenario>> ListAsync(CancellationToken ct = default);
}

public interface ISupportHotlineRepository
{
    Task<IReadOnlyList<SupportHotline>> ListAsync(CancellationToken ct = default);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
