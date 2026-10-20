using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;

namespace Vapless.Application.Factories;

public sealed class CravingInterventionFactory : ICravingInterventionFactory
{
    public InterventionDto Create(int intensity)
    {
        var level = Enum.IsDefined(typeof(CravingIntensity), intensity)
            ? (CravingIntensity)intensity
            : CravingIntensity.Moderado;

        return level switch
        {
            CravingIntensity.Leve => new InterventionDto(
                "PAUSA-1",
                "Pausa consciente",
                "Tomá agua, salí un minuto de donde estás y contá 10 respiraciones lentas.",
                false),
            CravingIntensity.Moderado => new InterventionDto(
                "RESP-478",
                "Respiración 4-7-8",
                "Inhalá 4 segundos, aguantá 7 y soltá en 8. Hacelo cuatro veces.",
                false),
            CravingIntensity.Fuerte => new InterventionDto(
                "RESP-478-DIST",
                "Respirá y cambiá de escena",
                "Hacé el ciclo 4-7-8 y después movete: lavate la cara, caminá o escribile a alguien.",
                false),
            _ => new InterventionDto(
                "RESP-478-APOYO",
                "Respirá y pedí apoyo",
                "Hacé el ciclo 4-7-8. Si el impulso sigue fuerte, llamá a la Línea Amiga 106. No estás solo.",
                true)
        };
    }
}
