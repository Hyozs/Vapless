namespace Vapless.Domain.Enums;

public enum EmotionalTrigger
{
    Curiosidad = 1,
    PresionSocial = 2,
    Ansiedad = 3,
    EstresAcademico = 4,
    Familia = 5,
    Aburrimiento = 6
}

public static class EmotionalTriggerExtensions
{
    public static string ToFriendlyName(this EmotionalTrigger trigger) => trigger switch
    {
        EmotionalTrigger.Curiosidad => "Curiosidad",
        EmotionalTrigger.PresionSocial => "Presión del parche",
        EmotionalTrigger.Ansiedad => "Ansiedad",
        EmotionalTrigger.EstresAcademico => "Estrés académico",
        EmotionalTrigger.Familia => "Situaciones en casa",
        EmotionalTrigger.Aburrimiento => "Aburrimiento",
        _ => "Sin dato"
    };
}

public enum FamilyContext
{
    AmbosPadres = 1,
    UnSoloPadre = 2,
    FamiliaExtensa = 3,
    Acudiente = 4,
    SoloEnCasa = 5,
    PrefiereNoDecir = 6
}

public static class FamilyContextExtensions
{
    public static string ToFriendlyName(this FamilyContext context) => context switch
    {
        FamilyContext.AmbosPadres => "Vive con ambos padres",
        FamilyContext.UnSoloPadre => "Vive con un solo padre",
        FamilyContext.FamiliaExtensa => "Vive con familia extensa",
        FamilyContext.Acudiente => "Vive con acudiente",
        FamilyContext.SoloEnCasa => "Pasa tardes solo en casa",
        _ => "Prefiere no decir"
    };
}
