using Vapless.Domain.Entities;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.RiskRules;

public sealed class FrequencyRiskRule : IRiskRule
{
    public string Code => "R-FREQ";
    public string Name => "Frecuencia diaria de uso";

    public RiskContribution Evaluate(RiskSurvey survey) => survey.FrequencyPerDay switch
    {
        >= 10 => new(3, "Uso muy frecuente: 10 o más episodios al día."),
        >= 5 => new(2, "Uso frecuente: entre 5 y 9 episodios al día."),
        >= 1 => new(1, "Uso diario: al menos un episodio al día."),
        _ => RiskContribution.None("Sin uso diario reportado.")
    };
}

public sealed class NicotineConcentrationRule : IRiskRule
{
    public string Code => "R-NIC";
    public string Name => "Concentración estimada de nicotina";

    public RiskContribution Evaluate(RiskSurvey survey)
    {
        var mg = survey.PrimaryDevice.EstimatedNicotineMgPerPod();
        return survey.PrimaryDevice switch
        {
            DeviceType.Desechable => new(2, $"Desechable con hasta {mg:0} mg de nicotina por pod."),
            DeviceType.PodRecargable => new(1.5, $"Pod recargable con alrededor de {mg:0} mg por recarga."),
            DeviceType.Mod => new(1, $"Mod con alrededor de {mg:0} mg por recarga."),
            _ => RiskContribution.None("No reporta dispositivo activo.")
        };
    }
}

public sealed class EarlyAgeRiskRule : IRiskRule
{
    public string Code => "R-AGE";
    public string Name => "Edad de inicio";

    public RiskContribution Evaluate(RiskSurvey survey) => survey.Age switch
    {
        <= 14 when survey.FrequencyPerDay >= 1 => new(2.5, "Inicio temprano (14 años o menos) con uso diario."),
        <= 15 when survey.FrequencyPerDay >= 1 => new(1.5, "Inicio a los 15 años o antes con uso diario."),
        _ => RiskContribution.None("Edad de inicio sin alerta adicional.")
    };
}

public sealed class FamilyContextRiskRule : IRiskRule
{
    public string Code => "R-FAM";
    public string Name => "Contexto familiar";

    public RiskContribution Evaluate(RiskSurvey survey) => survey.FamilyContext switch
    {
        FamilyContext.SoloEnCasa => new(2, "Pasa las tardes solo en casa: menos supervisión y más tiempo sin acompañamiento."),
        FamilyContext.Acudiente => new(1, "Vive con acudiente: puede faltar acompañamiento emocional cercano."),
        FamilyContext.UnSoloPadre => new(1, "Hogar con un solo padre: carga de tiempo y estrés familiar."),
        _ => RiskContribution.None("Contexto familiar sin factor adicional reportado.")
    };
}

public sealed class EmotionalTriggerRiskRule : IRiskRule
{
    public string Code => "R-EMO";
    public string Name => "Disparador emocional";

    public RiskContribution Evaluate(RiskSurvey survey) => survey.Trigger switch
    {
        EmotionalTrigger.Familia => new(2, "Vapea para evadir situaciones familiares."),
        EmotionalTrigger.Ansiedad => new(2, "Usa el vapeo como regulador de ansiedad."),
        EmotionalTrigger.PresionSocial => new(1.5, "Consumo asociado a presión del grupo de pares."),
        EmotionalTrigger.EstresAcademico => new(1, "Consumo asociado al estrés académico."),
        EmotionalTrigger.Aburrimiento => new(0.5, "Consumo asociado al aburrimiento."),
        _ => RiskContribution.None("Sin disparador emocional de riesgo reportado.")
    };
}

public sealed class SchoolUseRiskRule : IRiskRule
{
    public string Code => "R-SCH";
    public string Name => "Uso en el colegio";

    public RiskContribution Evaluate(RiskSurvey survey) => survey.UsesInSchool
        ? new(1.5, "Reporta uso dentro del colegio: el consumo ya entró al entorno escolar.")
        : RiskContribution.None("No reporta uso dentro del colegio.");
}

