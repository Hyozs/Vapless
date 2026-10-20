using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;
using Vapless.Domain.Security;

namespace Vapless.Application.Services;

public sealed class PsychoSocialAnalysisService : IPsychoSocialAnalysisService
{
    private readonly ISurveyRepository _surveys;
    private readonly IKAnonymityEvaluator _anonymity;

    public PsychoSocialAnalysisService(ISurveyRepository surveys, IKAnonymityEvaluator anonymity)
    {
        _surveys = surveys;
        _anonymity = anonymity;
    }

    public async Task<PsychoSocialAnalysisDto> GetAnalysisAsync(CancellationToken ct = default)
    {
        var surveys = await _surveys.ListAsync(ct);
        var total = surveys.Count;
        var insights = new List<PsychoSocialInsightDto>();

        var familyRisk = surveys.Count(s =>
            s.FamilyContext is FamilyContext.SoloEnCasa or FamilyContext.Acudiente or FamilyContext.UnSoloPadre);
        insights.Add(new PsychoSocialInsightDto(
            "Casa y soledad no acompañada",
            familyRisk == 0
                ? "Todavía no hay respuestas suficientes sobre el contexto familiar."
                : $"{Percent(familyRisk, total)}% reporta tardes sin acompañamiento cercano o un hogar con un solo cuidador.",
            "Abrir espacios de acompañamiento en el colegio y una escuela de familias que hable de vapeo sin castigo.",
            _anonymity.HasSufficientData(total)));

        var anxietyRisk = surveys.Count(s =>
            s.Trigger is EmotionalTrigger.Ansiedad or EmotionalTrigger.Familia);
        insights.Add(new PsychoSocialInsightDto(
            "El vape como calmante emocional",
            anxietyRisk == 0
                ? "Aún no hay datos suficientes sobre disparadores emocionales."
                : $"{Percent(anxietyRisk, total)}% asocia el vapeo con ansiedad o situaciones familiares.",
            "Entrenar regulación emocional corta (respiración, pausa activa) y derivar a psicoorientación sin convertirlo en reporte disciplinario.",
            _anonymity.HasSufficientData(total)));

        var peerRisk = surveys.Count(s =>
            s.Trigger == EmotionalTrigger.PresionSocial || s.UsesInSchool);
        insights.Add(new PsychoSocialInsightDto(
            "Presión del parche y uso escolar",
            peerRisk == 0
                ? "Aún no hay datos suficientes sobre presión social."
                : $"{Percent(peerRisk, total)}% relaciona el consumo con el grupo de amigos o con el entorno escolar.",
            "Trabajar normas sociales reales: la mayoría no vapea. Entrenar respuestas asertivas cortas y cambiar el estatus del vape en el recreo.",
            _anonymity.HasSufficientData(total)));

        var earlyUse = surveys.Count(s => s.Age <= 14 && s.FrequencyPerDay >= 1);
        insights.Add(new PsychoSocialInsightDto(
            "Inicio temprano",
            earlyUse == 0
                ? "No se observa inicio temprano con uso diario en la muestra actual."
                : $"{Percent(earlyUse, total)}% empezó a los 14 años o antes y ya usa a diario.",
            "Priorizar prevención en 6° a 8° con contenidos de 3 minutos, no charlas largas.",
            _anonymity.HasSufficientData(total)));

        var deviceRisk = surveys.Count(s => s.PrimaryDevice == DeviceType.Desechable);
        insights.Add(new PsychoSocialInsightDto(
            "Desechables: la puerta de entrada",
            deviceRisk == 0
                ? "Aún no hay datos suficientes sobre tipo de dispositivo."
                : $"{Percent(deviceRisk, total)}% usa desechables, el formato más fácil de esconder y de regalar.",
            "Pedir a tiendas del barrio verificación real de edad y visibilizar el costo anual del consumo.",
            _anonymity.HasSufficientData(total)));

        return new PsychoSocialAnalysisDto(total, _anonymity.K, insights);
    }

    private static int Percent(int part, int total) =>
        total <= 0 ? 0 : (int)Math.Round(part * 100.0 / total);

    public static int RequiredSample => KAnonymityPolicy.K;
}
