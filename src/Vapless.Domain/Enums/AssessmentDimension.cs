namespace Vapless.Domain.Enums;

public enum AssessmentDimension
{
    Frecuencia = 0,
    DependenciaEmocional = 1,
    Control = 2,
    Entorno = 3
}

public static class AssessmentDimensionExtensions
{
    public static string ToFriendlyName(this AssessmentDimension dimension) => dimension switch
    {
        AssessmentDimension.Frecuencia => "Frecuencia y horarios",
        AssessmentDimension.DependenciaEmocional => "Dependencia emocional",
        AssessmentDimension.Control => "Control del consumo",
        AssessmentDimension.Entorno => "Entorno y presión escolar",
        _ => "Dimensión"
    };

    public static decimal Weight(this AssessmentDimension dimension) => dimension switch
    {
        AssessmentDimension.Frecuencia => 0.25m,
        AssessmentDimension.DependenciaEmocional => 0.30m,
        AssessmentDimension.Control => 0.25m,
        AssessmentDimension.Entorno => 0.20m,
        _ => 0m
    };
}
