using Microsoft.EntityFrameworkCore;
using Vapless.Domain.Entities;
using Vapless.Domain.Interfaces;

namespace Vapless.Infrastructure.Repositories;

public sealed class CravingRepository : ICravingRepository
{
    private readonly Data.VaplessDbContext _db;
    public CravingRepository(Data.VaplessDbContext db) => _db = db;

    public async Task AddAsync(Craving craving, CancellationToken ct = default) =>
        await _db.Cravings.AddAsync(craving, ct);

    public async Task<IReadOnlyList<Craving>> ListByProgressAsync(int userProgressId, CancellationToken ct = default) =>
        await _db.Cravings.AsNoTracking()
            .Where(c => c.UserProgressId == userProgressId)
            .OrderByDescending(c => c.OccurredAt)
            .ToListAsync(ct);

    public Task<int> CountByProgressAsync(int userProgressId, CancellationToken ct = default) =>
        _db.Cravings.CountAsync(c => c.UserProgressId == userProgressId, ct);
}

public sealed class SurveyRepository : ISurveyRepository
{
    private readonly Data.VaplessDbContext _db;
    public SurveyRepository(Data.VaplessDbContext db) => _db = db;

    public async Task AddAsync(RiskSurvey survey, CancellationToken ct = default) =>
        await _db.RiskSurveys.AddAsync(survey, ct);

    public async Task<IReadOnlyList<RiskSurvey>> ListAsync(CancellationToken ct = default) =>
        await _db.RiskSurveys.AsNoTracking().ToListAsync(ct);
}

public sealed class ProfileRepository : IProfileRepository
{
    private readonly Data.VaplessDbContext _db;
    public ProfileRepository(Data.VaplessDbContext db) => _db = db;

    public Task<UserProgress?> GetAsync(int id, CancellationToken ct = default) =>
        _db.UserProgresses.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<UserProgress> GetOrCreateDefaultAsync(CancellationToken ct = default)
    {
        var progress = await _db.UserProgresses
            .Where(p => p.IsActive)
            .OrderBy(p => p.Id)
            .FirstOrDefaultAsync(ct);

        if (progress is not null)
        {
            return progress;
        }

        progress = new UserProgress
        {
            Alias = "parcero",
            QuitDate = DateTime.UtcNow.Date,
            DailyCostCop = 8_000m,
            NicotineMgPerPod = 50m,
            PodsPerWeek = 3,
            PrimaryDevice = Domain.Enums.DeviceType.Desechable,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _db.UserProgresses.AddAsync(progress, ct);
        await _db.SaveChangesAsync(ct);
        return progress;
    }

    public async Task AddAsync(UserProgress progress, CancellationToken ct = default) =>
        await _db.UserProgresses.AddAsync(progress, ct);
}

public sealed class HackCardRepository : IHackCardRepository
{
    private readonly Data.VaplessDbContext _db;
    public HackCardRepository(Data.VaplessDbContext db) => _db = db;

    public async Task<IReadOnlyList<HackCard>> ListAsync(CancellationToken ct = default) =>
        await _db.HackCards.AsNoTracking().OrderBy(c => c.Category).ThenBy(c => c.SortOrder).ToListAsync(ct);

    public Task<HackCard?> GetAsync(int id, CancellationToken ct = default) =>
        _db.HackCards.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);
}

public sealed class SocialScenarioRepository : ISocialScenarioRepository
{
    private readonly Data.VaplessDbContext _db;
    public SocialScenarioRepository(Data.VaplessDbContext db) => _db = db;

    public async Task<IReadOnlyList<SocialScenario>> ListAsync(CancellationToken ct = default) =>
        await _db.SocialScenarios.AsNoTracking().ToListAsync(ct);
}

public sealed class SupportHotlineRepository : ISupportHotlineRepository
{
    private readonly Data.VaplessDbContext _db;
    public SupportHotlineRepository(Data.VaplessDbContext db) => _db = db;

    public async Task<IReadOnlyList<SupportHotline>> ListAsync(CancellationToken ct = default) =>
        await _db.SupportHotlines.AsNoTracking().ToListAsync(ct);
}

public sealed class SchoolAirRepository : ISchoolAirRepository
{
    private readonly Data.VaplessDbContext _db;
    public SchoolAirRepository(Data.VaplessDbContext db) => _db = db;

    public async Task AddAsync(SchoolAirReading reading, CancellationToken ct = default) =>
        await _db.SchoolAirReadings.AddAsync(reading, ct);

    public async Task<IReadOnlyList<SchoolAirReading>> ListLatestAsync(int take, CancellationToken ct = default) =>
        await _db.SchoolAirReadings.AsNoTracking()
            .OrderByDescending(r => r.RecordedAt)
            .Take(take)
            .ToListAsync(ct);
}

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly Data.VaplessDbContext _db;
    public UnitOfWork(Data.VaplessDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
