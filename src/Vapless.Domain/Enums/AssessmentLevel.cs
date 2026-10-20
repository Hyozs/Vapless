namespace Vapless.Domain.Enums;

public enum AssessmentLevel
{
    Leve = 0,
    Moderado = 1,
    Grave = 2
}

public static class AssessmentLevelExtensions
{
    public static string ToFriendlyName(this AssessmentLevel level) => level switch
    {
        AssessmentLevel.Leve => "Leve / Bajo",
        AssessmentLevel.Moderado => "Moderado",
        AssessmentLevel.Grave => "Grave / Alerta Alta",
        _ => "Leve / Bajo"
    };
}
