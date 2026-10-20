namespace Vapless.Domain.Enums;

public enum RiskLevel
{
    Bajo = 0,
    Medio = 1,
    Alto = 2,
    MuyAlto = 3
}

public static class RiskLevelExtensions
{
    public static RiskLevel FromIndex(double index) => index switch
    {
        < 2.5 => RiskLevel.Bajo,
        < 5.0 => RiskLevel.Medio,
        < 7.5 => RiskLevel.Alto,
        _ => RiskLevel.MuyAlto
    };

    public static string ToFriendlyName(this RiskLevel level) => level switch
    {
        RiskLevel.Bajo => "Bajo",
        RiskLevel.Medio => "Medio",
        RiskLevel.Alto => "Alto",
        _ => "Muy alto"
    };
}

public enum HackDeckCategory
{
    MitosDelCuerpo = 1,
    NegocioDelSabor = 2,
    PresionYParche = 3,
    LoQueHayDetras = 4
}

public static class HackDeckCategoryExtensions
{
    public static string ToFriendlyName(this HackDeckCategory category) => category switch
    {
        HackDeckCategory.MitosDelCuerpo => "Mitos del cuerpo",
        HackDeckCategory.NegocioDelSabor => "El negocio del sabor",
        HackDeckCategory.PresionYParche => "Presión y parche",
        _ => "Lo que hay detrás"
    };
}
