namespace Vapless.Domain.Security;

public sealed class KAnonymityPolicy
{
    public const int K = 5;

    public static bool HasSufficientData(int sampleSize) => sampleSize >= K;

    public static string MaskedMessage =>
        "Todavía no hay suficientes respuestas en esta comuna. Con 5 o más activamos el mapa.";
}
