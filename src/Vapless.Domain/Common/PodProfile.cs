using Vapless.Domain.Enums;

namespace Vapless.Domain.Common;

public sealed record PodProfile(
    DeviceType Device,
    string Name,
    decimal NicotineMgPerPod,
    decimal CigarettesEquivalentPerPod,
    decimal EstimatedCostCop,
    string NicotineRange,
    string Note);

public static class PodProfileCatalog
{
    private static readonly IReadOnlyDictionary<DeviceType, PodProfile> Profiles =
        new Dictionary<DeviceType, PodProfile>
        {
            [DeviceType.NoUsa] = new(
                DeviceType.NoUsa,
                "No usa",
                0m,
                0m,
                0m,
                "0 mg",
                "Sin consumo de pods la referencia semanal es 0 mg y 0 COP."),
            [DeviceType.Desechable] = new(
                DeviceType.Desechable,
                "Desechable",
                50m,
                50m,
                15_000m,
                "20-50 mg",
                "Un desechable de 2 ml a 5% de nicotina lleva entre 20 y 50 mg. Se toma el promedio del rango."),
            [DeviceType.PodRecargable] = new(
                DeviceType.PodRecargable,
                "Pod recargable",
                30m,
                30m,
                25_000m,
                "20-40 mg",
                "Un pod recargable de 1 ml a 3% lleva entre 20 y 40 mg. Se toma el promedio del rango."),
            [DeviceType.Mod] = new(
                DeviceType.Mod,
                "Mod / caja",
                20m,
                20m,
                40_000m,
                "10-30 mg",
                "En un mod la nicotina se carga a medida: depende del líquido y de cuántas caladas das por carga.")
        };

    public static PodProfile For(DeviceType device) =>
        Profiles.TryGetValue(device, out var profile) ? profile : Profiles[DeviceType.NoUsa];

    public static IReadOnlyCollection<PodProfile> All => Profiles.Values.ToList();
}
