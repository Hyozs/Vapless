using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class ProfileService : IProfileService
{
    private readonly IProfileRepository _profiles;
    private readonly IUnitOfWork _unitOfWork;

    public ProfileService(IProfileRepository profiles, IUnitOfWork unitOfWork)
    {
        _profiles = profiles;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProfileDto> GetCurrentAsync(int? profileId, CancellationToken ct = default)
    {
        var profile = profileId is null
            ? await _profiles.GetOrCreateDefaultAsync(ct)
            : await _profiles.GetAsync(profileId.Value, ct)
              ?? throw new KeyNotFoundException("No encontramos ese perfil local.");

        return Map(profile);
    }

    public async Task<ProfileDto> UpdateAsync(ProfileUpsertDto update, CancellationToken ct = default)
    {
        var profile = await _profiles.GetOrCreateDefaultAsync(ct);

        if (!string.IsNullOrWhiteSpace(update.Alias))
        {
            profile.Alias = update.Alias.Trim();
        }

        if (update.QuitDate is not null)
        {
            profile.QuitDate = update.QuitDate.Value.Kind == DateTimeKind.Utc
                ? update.QuitDate.Value
                : update.QuitDate.Value.ToUniversalTime();
        }

        if (update.DailyCostCop is not null)
        {
            profile.DailyCostCop = Math.Clamp(update.DailyCostCop.Value, 0m, 500_000m);
        }

        if (update.NicotineMgPerPod is not null)
        {
            profile.NicotineMgPerPod = Math.Clamp(update.NicotineMgPerPod.Value, 0m, 200m);
        }

        if (update.PodsPerWeek is not null)
        {
            profile.PodsPerWeek = Math.Clamp(update.PodsPerWeek.Value, 0, 70);
        }

        if (update.PrimaryDevice is not null && Enum.IsDefined(typeof(DeviceType), update.PrimaryDevice.Value))
        {
            profile.PrimaryDevice = (DeviceType)update.PrimaryDevice.Value;
        }

        await _unitOfWork.SaveChangesAsync(ct);
        return Map(profile);
    }

    private static ProfileDto Map(Domain.Entities.UserProgress profile) =>
        new(profile.Id, profile.Alias, profile.QuitDate, profile.DailyCostCop,
            profile.NicotineMgPerPod, profile.PodsPerWeek, (int)profile.PrimaryDevice);
}

