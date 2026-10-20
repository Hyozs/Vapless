using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class SavingsService : ISavingsService
{
    private readonly IProfileRepository _profiles;
    private readonly ISavingsCalculator _calculator;
    private readonly ISavingsComparisonCatalog _catalog;
    private readonly INicotineProfileService _nicotine;

    public SavingsService(
        IProfileRepository profiles,
        ISavingsCalculator calculator,
        ISavingsComparisonCatalog catalog,
        INicotineProfileService nicotine)
    {
        _profiles = profiles;
        _calculator = calculator;
        _catalog = catalog;
        _nicotine = nicotine;
    }

    public async Task<SavingsSummaryDto> GetSummaryAsync(int? profileId, CancellationToken ct = default)
    {
        var profile = profileId is null
            ? await _profiles.GetOrCreateDefaultAsync(ct)
            : await _profiles.GetAsync(profileId.Value, ct)
              ?? throw new KeyNotFoundException("No encontramos ese perfil local.");

        var now = DateTime.UtcNow;
        var days = _calculator.DaysClean(profile, now);
        var cop = _calculator.CopSaved(profile, now);
        var nicotine = _calculator.NicotineAvoidedMg(profile, now);
        var nicotineProfile = await _nicotine.GetAsync(profile.Id, ct);

        var nicotinePhrase = nicotine <= 0
            ? "Cada día sin vape es nicotina que tu cuerpo no recibe."
            : $"Evitaste {nicotine:0.#} mg de nicotina. Tus pulmones y tu cerebro te lo agradecen.";

        return new SavingsSummaryDto(
            days,
            cop,
            nicotine,
            profile.DailyCostCop,
            _catalog.BuildPhrase(cop),
            nicotinePhrase,
            _catalog.BuildGoalProgress(cop),
            nicotineProfile);
    }
}
