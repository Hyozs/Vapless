using Vapless.Application.Calculators;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class NicotineProfileService : INicotineProfileService
{
    private readonly IProfileRepository _profiles;
    private readonly ICalculatorStrategy<PodProfileInput, NicotineProfileSnapshot> _calculator;

    public NicotineProfileService(
        IProfileRepository profiles,
        ICalculatorStrategy<PodProfileInput, NicotineProfileSnapshot> calculator)
    {
        _profiles = profiles;
        _calculator = calculator;
    }

    public async Task<NicotineProfileDto> GetAsync(int? profileId, CancellationToken ct = default)
    {
        var profile = profileId is null
            ? await _profiles.GetOrCreateDefaultAsync(ct)
            : await _profiles.GetAsync(profileId.Value, ct)
              ?? throw new KeyNotFoundException("No encontramos ese perfil local.");

        var snapshot = _calculator.Calculate(new PodProfileInput(profile, DateTime.UtcNow));

        return new NicotineProfileDto(
            snapshot.PodType,
            snapshot.PodTypeName,
            snapshot.NicotineMgPerPod,
            snapshot.CigarettesPerPod,
            snapshot.PodCostCop,
            snapshot.PodsPerWeek,
            snapshot.WeeklyNicotineMg,
            snapshot.DailyNicotineMg,
            snapshot.WeeklyCigarettes,
            snapshot.NicotineIngestedMg,
            snapshot.NicotineAvoidedMg,
            snapshot.CigarettesAvoided,
            snapshot.WeeklyCostCop,
            snapshot.CopSaved,
            snapshot.Phrase);
    }
}
