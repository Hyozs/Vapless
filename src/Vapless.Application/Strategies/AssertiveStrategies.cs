using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;

namespace Vapless.Application.Strategies;

public sealed class HumorResponseStrategy : IAssertiveStrategy
{
    public string Code => "Humor";

    public string BuildResponse(SocialScenario scenario) =>
        $"\"Jajaja no, parce. Hoy ando modo avión. Vamos por algo rico y me contás.\"";
}

public sealed class DirectAssertiveStrategy : IAssertiveStrategy
{
    public string Code => "Directa";

    public string BuildResponse(SocialScenario scenario) =>
        "\"No, gracias. No quiero vapear y ya. Sin drama.\"";
}

public sealed class AlternativeResponseStrategy : IAssertiveStrategy
{
    public string Code => "Alternativa";

    public string BuildResponse(SocialScenario scenario) =>
        "\"Mejor cambiemos el plan: vamos por unos buñuelos o jugamos una partida.\"";
}
