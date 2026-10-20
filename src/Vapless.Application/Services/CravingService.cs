using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class CravingService : ICravingService
{
    private readonly ICravingRepository _cravings;
    private readonly IProfileRepository _profiles;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISavingsCalculator _calculator;
    private readonly ICravingEventPublisher _publisher;
    private readonly ICravingInterventionFactory _interventions;

    public CravingService(
        ICravingRepository cravings,
        IProfileRepository profiles,
        IUnitOfWork unitOfWork,
        ISavingsCalculator calculator,
        ICravingEventPublisher publisher,
        ICravingInterventionFactory interventions)
    {
        _cravings = cravings;
        _profiles = profiles;
        _unitOfWork = unitOfWork;
        _calculator = calculator;
        _publisher = publisher;
        _interventions = interventions;
    }

    public async Task<CravingResultDto> RegisterAsync(CravingRequestDto request, CancellationToken ct = default)
    {
        if (request.Intensity is < 1 or > 4)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "La intensidad debe estar entre 1 y 4.");
        }

        if (request.MinutesResisted is < 0 or > 240)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Los minutos resistidos deben estar entre 0 y 240.");
        }

        var profile = request.ProfileId is null
            ? await _profiles.GetOrCreateDefaultAsync(ct)
            : await _profiles.GetAsync(request.ProfileId.Value, ct)
              ?? throw new KeyNotFoundException("No encontramos ese perfil local.");

        var trigger = Enum.IsDefined(typeof(EmotionalTrigger), request.Trigger ?? 1)
            ? (EmotionalTrigger)(request.Trigger ?? 1)
            : EmotionalTrigger.Curiosidad;

        var log = new Craving
        {
            UserProgressId = profile.Id,
            OccurredAt = DateTime.UtcNow,
            Intensity = (CravingIntensity)request.Intensity,
            MinutesResisted = request.MinutesResisted,
            Overcome = true,
            StrategyUsed = string.IsNullOrWhiteSpace(request.StrategyUsed)
                ? "Respiracion478"
                : request.StrategyUsed.Trim(),
            Trigger = trigger
        };

        await _cravings.AddAsync(log, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var messages = await _publisher.PublishAsync(log, profile, ct);
        var days = _calculator.DaysClean(profile, DateTime.UtcNow);
        var cop = _calculator.CopSaved(profile, DateTime.UtcNow);
        var nicotine = _calculator.NicotineAvoidedMg(profile, DateTime.UtcNow);

        return new CravingResultDto(
            log.Id,
            days,
            cop,
            nicotine,
            days == 0 ? "Antojo superado. Hoy ya ganaste." : $"Antojo superado. Racha de {days} día(s).",
            messages,
            _interventions.Create(request.Intensity));
    }

    public async Task<IReadOnlyList<CravingHistoryItemDto>> GetHistoryAsync(int profileId, CancellationToken ct = default)
    {
        var logs = await _cravings.ListByProgressAsync(profileId, ct);
        return logs
            .OrderByDescending(l => l.OccurredAt)
            .Select(l => new CravingHistoryItemDto(
                l.Id,
                l.OccurredAt,
                (int)l.Intensity,
                l.MinutesResisted,
                l.Overcome,
                l.StrategyUsed,
                l.Trigger.ToFriendlyName()))
            .ToList();
    }
}

