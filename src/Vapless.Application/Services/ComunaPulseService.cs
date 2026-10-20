using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class ComunaPulseService : IComunaPulseService
{
    private readonly ISurveyRepository _surveys;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEnumerable<IRiskRule> _rules;
    private readonly IKAnonymityEvaluator _anonymity;

    public ComunaPulseService(
        ISurveyRepository surveys,
        IUnitOfWork unitOfWork,
        IEnumerable<IRiskRule> rules,
        IKAnonymityEvaluator anonymity)
    {
        _surveys = surveys;
        _unitOfWork = unitOfWork;
        _rules = rules;
        _anonymity = anonymity;
    }

    public async Task<SurveyAcceptedDto> SubmitAsync(SurveySubmissionDto submission, CancellationToken ct = default)
    {
        if (!ComunaCatalog.IsValid(submission.ComunaCode))
        {
            throw new ArgumentException("Esa comuna no existe en Medellín.");
        }

        if (submission.Age is < 12 or > 19)
        {
            throw new ArgumentException("La encuesta es para estudiantes entre 12 y 19 años.");
        }

        if (submission.FrequencyPerDay is < 0 or > 40)
        {
            throw new ArgumentException("La frecuencia diaria debe estar entre 0 y 40.");
        }

        if (!Enum.IsDefined(typeof(DeviceType), submission.DeviceType))
        {
            throw new ArgumentException("Tipo de dispositivo no válido.");
        }

        if (!Enum.IsDefined(typeof(EmotionalTrigger), submission.Trigger))
        {
            throw new ArgumentException("Disparador emocional no válido.");
        }

        if (!Enum.IsDefined(typeof(FamilyContext), submission.FamilyContext))
        {
            throw new ArgumentException("Contexto familiar no válido.");
        }

        var survey = new RiskSurvey
        {
            Comuna = ComunaCatalog.FromCode(submission.ComunaCode),
            Age = submission.Age,
            PrimaryDevice = (DeviceType)submission.DeviceType,
            FrequencyPerDay = submission.FrequencyPerDay,
            UsesInSchool = submission.UsesInSchool,
            Trigger = (EmotionalTrigger)submission.Trigger,
            FamilyContext = (FamilyContext)submission.FamilyContext,
            SubmittedAt = DateTime.UtcNow
        };

        await _surveys.AddAsync(survey, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var comuna = ComunaCatalog.GetName(survey.Comuna);
        return new SurveyAcceptedDto(
            true,
            $"Gracias, ya quedó. Tu respuesta es anónima y ayuda a leer el pulso de {comuna}.",
            submission.ComunaCode,
            comuna);
    }

    public async Task<ComunaRiskMapDto> GetRiskMapAsync(CancellationToken ct = default)
    {
        var surveys = await _surveys.ListAsync(ct);

        var results = surveys
            .GroupBy(s => s.Comuna)
            .OrderBy(g => (int)g.Key)
            .Select(group =>
            {
                var sample = group.ToList();
                var enough = _anonymity.HasSufficientData(sample.Count);
                if (!enough)
                {
                    return new ComunaRiskResultDto(
                        (int)group.Key,
                        ComunaCatalog.GetName(group.Key),
                        0,
                        sample.Count,
                        false,
                        "Sin datos suficientes",
                        [_anonymity.MaskedMessage]);
                }

                var contributions = new List<RiskContribution>();
                foreach (var survey in sample)
                {
                    foreach (var rule in _rules)
                    {
                        contributions.Add(rule.Evaluate(survey));
                    }
                }

                var points = contributions.Sum(c => c.Points);
                var index = Math.Min(10, Math.Round(points / 13.0 * 10, 1));

                var reasons = contributions
                    .Where(c => c.Points > 0)
                    .GroupBy(c => c.Reason)
                    .OrderByDescending(g => g.Sum(c => c.Points))
                    .Select(g => g.Key)
                    .Take(5)
                    .ToList();

                if (reasons.Count == 0)
                {
                    reasons.Add("El grupo reporta bajo uso y factores protectores.");
                }

                return new ComunaRiskResultDto(
                    (int)group.Key,
                    ComunaCatalog.GetName(group.Key),
                    index,
                    sample.Count,
                    true,
                    RiskLevelExtensions.FromIndex(index).ToFriendlyName(),
                    reasons);
            })
            .ToList();

        var topTriggers = new List<string>();
        if (_anonymity.HasSufficientData(surveys.Count))
        {
            topTriggers = surveys
                .GroupBy(s => s.Trigger)
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => $"{g.Key.ToFriendlyName()} ({g.Count()} respuestas)")
                .ToList();
        }

        return new ComunaRiskMapDto(
            DateTime.UtcNow,
            _anonymity.K,
            surveys.Count,
            results,
            topTriggers);
    }
}

