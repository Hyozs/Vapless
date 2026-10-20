using Vapless.Application.Assessments;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;

namespace Vapless.Application.Services;

public sealed class AssessmentService : IAssessmentService
{
    private const int GraveThreshold = 60;
    private const int ModeradoThreshold = 30;

    private readonly ISupportService _support;

    public AssessmentService(ISupportService support) => _support = support;

    public Task<AssessmentQuestionsDto> GetQuestionsAsync(CancellationToken ct = default)
    {
        var questions = AssessmentQuestionBank.All
            .Select(question => new AssessmentQuestionDto(
                question.Id,
                question.Dimension.ToString(),
                question.Dimension.ToFriendlyName(),
                question.Prompt,
                question.Helper,
                question.Options
                    .Select(option => new AssessmentOptionDto(option.Id, option.Label, option.Value))
                    .ToList()))
            .ToList();

        return Task.FromResult(new AssessmentQuestionsDto(questions.Count, questions));
    }

    public async Task<AssessmentResultDto> EvaluateAsync(
        AssessmentSubmissionDto submission,
        CancellationToken ct = default)
    {
        var answers = submission?.Answers ?? [];
        if (answers.Count == 0)
        {
            throw new ArgumentException("Responde las preguntas del test para ver tu resultado.");
        }

        var bank = AssessmentQuestionBank.All;
        var totals = new Dictionary<AssessmentDimension, (int Sum, int Count)>();
        var answered = 0;

        foreach (var answer in answers)
        {
            var question = bank.FirstOrDefault(item => item.Id == answer.QuestionId);
            if (question is null)
            {
                continue;
            }

            var option = question.Options.FirstOrDefault(item => item.Id == answer.OptionId);
            if (option is null)
            {
                continue;
            }

            answered++;
            var current = totals.GetValueOrDefault(question.Dimension);
            totals[question.Dimension] = (current.Sum + option.Value, current.Count + 1);
        }

        if (answered == 0)
        {
            throw new ArgumentException("No pudimos leer tus respuestas. Vuelve a intentarlo.");
        }

        var dimensions = new List<AssessmentDimensionResultDto>();
        var weighted = 0m;
        var weightUsed = 0m;

        foreach (var dimension in Enum.GetValues<AssessmentDimension>())
        {
            var (sum, count) = totals.GetValueOrDefault(dimension);
            var dimensionScore = count == 0 ? 0 : (int)Math.Round(sum / (3m * count) * 100m);
            var weight = dimension.Weight();
            weighted += dimensionScore * weight;
            weightUsed += weight;

            dimensions.Add(new AssessmentDimensionResultDto(
                dimension.ToString(),
                dimension.ToFriendlyName(),
                dimensionScore,
                FindingFor(dimension, dimensionScore)));
        }

        var score = weightUsed == 0 ? 0 : (int)Math.Round(weighted / weightUsed);
        var level = score >= GraveThreshold
            ? AssessmentLevel.Grave
            : score >= ModeradoThreshold
                ? AssessmentLevel.Moderado
                : AssessmentLevel.Leve;

        var hotlines = await _support.GetHotlinesAsync(ct);
        var supportLines = hotlines
            .Select(line => new AssessmentSupportLineDto(
                line.Name,
                line.Phone,
                line.Description,
                line.Phone.Contains("123")))
            .ToList();

        return new AssessmentResultDto(
            score,
            level.ToString(),
            level.ToFriendlyName(),
            HeadlineFor(level),
            level == AssessmentLevel.Grave,
            dimensions,
            dimensions.Where(item => item.Score >= 50).Select(item => item.Finding).ToList(),
            RecommendationsFor(level),
            supportLines);
    }

    private static string HeadlineFor(AssessmentLevel level) => level switch
    {
        AssessmentLevel.Grave => "Esto ya pide acompañamiento profesional",
        AssessmentLevel.Moderado => "Hay señales claras: ajustá la estrategia ya",
        _ => "Hoy tenés el control: mantené el margen"
    };

    private static IReadOnlyList<string> RecommendationsFor(AssessmentLevel level) => level switch
    {
        AssessmentLevel.Grave =>
        [
            "Hablá hoy con un profesional: la Línea Amiga 106 da orientación psicológica confidencial 24/7 en Medellín.",
            "Si hay riesgo para tu salud o una urgencia, llamá a la Línea 123.",
            "Contale a un adulto de confianza qué está pasando: no lo vas a cargar solo.",
            "Mientras buscás apoyo, registrá cada antojo y usá la respiración cuadrada 4-4-4 antes de comprar un pod."
        ],
        AssessmentLevel.Moderado =>
        [
            "Usá la respiración cuadrada 4-4-4 cuando llegue el impulso, antes de pedir un pod.",
            "Bajá la frecuencia de a poco: menos días a la semana, no todo o nada.",
            "Pedí una cita en psicoorientación escolar: es confidencial y no es un reporte."
        ],
        _ =>
        [
            "Seguí registrando los antojos que superás: cada registro sostiene la racha.",
            "Mantené la respiración cuadrada 4-4-4 a mano para los momentos de pico.",
            "Contá con alguien de confianza cómo venés: el apoyo social sostiene el cambio."
        ]
    };

    private static string FindingFor(AssessmentDimension dimension, int score) => (dimension, score) switch
    {
        (AssessmentDimension.Frecuencia, < 34) => "Tu consumo todavía es espaciado y bajo: no hay patrón automático diario.",
        (AssessmentDimension.Frecuencia, < 67) => "Hay una frecuencia que ya se vuelve automática en algunos momentos del día.",
        (AssessmentDimension.Frecuencia, _) => "Consumo alto y muy seguido, con patrón de dependencia marcada.",
        (AssessmentDimension.DependenciaEmocional, < 34) => "No usás el vape como regulador principal de tus emociones.",
        (AssessmentDimension.DependenciaEmocional, < 67) => "El vape ya aparece como respuesta a la ansiedad o al cansancio.",
        (AssessmentDimension.DependenciaEmocional, _) => "Dependencia emocional alta: el cuerpo pide nicotina para calmarse.",
        (AssessmentDimension.Control, < 34) => "Tenés control sobre el consumo y los intentos te han funcionado.",
        (AssessmentDimension.Control, < 67) => "Hay intentos de reducir que no lograste mantener.",
        (AssessmentDimension.Control, _) => "Pérdida de control marcada: los intentos de reducción fracasan o tenés que ocultar el consumo.",
        (AssessmentDimension.Entorno, < 34) => "El entorno escolar no está empujando tu consumo.",
        (AssessmentDimension.Entorno, < 67) => "Hay consumo dentro del colegio y situaciones de presión entre pares.",
        _ => "La presión del entorno es permanente: el consumo ya está atado a tu rutina escolar."
    };
}
