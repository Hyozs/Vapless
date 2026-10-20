namespace Vapless.Domain.Enums;

public enum DeviceType
{
    NoUsa = 0,
    Desechable = 1,
    PodRecargable = 2,
    Mod = 3
}

public static class DeviceTypeExtensions
{
    public static decimal EstimatedNicotineMgPerPod(this DeviceType device) => device switch
    {
        DeviceType.Desechable => 50m,
        DeviceType.PodRecargable => 30m,
        DeviceType.Mod => 20m,
        _ => 0m
    };

    public static string ToFriendlyName(this DeviceType device) => device switch
    {
        DeviceType.Desechable => "Desechable",
        DeviceType.PodRecargable => "Pod recargable",
        DeviceType.Mod => "Mod / caja",
        _ => "No usa"
    };
}
