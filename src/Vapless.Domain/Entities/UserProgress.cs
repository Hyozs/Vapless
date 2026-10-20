using Vapless.Domain.Common;
using Vapless.Domain.Enums;

namespace Vapless.Domain.Entities;

public class UserProgress : BaseEntity
{
    public string Alias { get; set; } = "parcero";
    public DateTime QuitDate { get; set; } = DateTime.UtcNow;
    public decimal DailyCostCop { get; set; } = 8_000m;
    public decimal NicotineMgPerPod { get; set; } = 50m;
    public int PodsPerWeek { get; set; } = 3;
    public DeviceType PrimaryDevice { get; set; } = DeviceType.Desechable;
    public bool IsActive { get; set; } = true;

    public PodProfile PodProfile => PodProfileCatalog.For(PrimaryDevice);

    public decimal NicotineMgPerDay => PodsPerWeek / 7m * NicotineMgPerPod;

    public decimal NicotineMgPerWeek => PodsPerWeek * NicotineMgPerPod;

    public decimal CigarettesEquivalentPerWeek => PodsPerWeek * PodProfile.CigarettesEquivalentPerPod;

    public decimal WeeklyCostCop => PodsPerWeek * PodProfile.EstimatedCostCop;

    public int DaysClean(DateTime asOf)
    {
        var days = (asOf.Date - QuitDate.Date).Days;
        return days < 0 ? 0 : days;
    }

    public decimal CopSaved(DateTime asOf) => DaysClean(asOf) * DailyCostCop;

    public decimal NicotineAvoidedMg(DateTime asOf) => DaysClean(asOf) * NicotineMgPerDay;

    public decimal NicotineIngestedMg(DateTime asOf) => NicotineMgPerWeek * (DaysClean(asOf) / 7m);

    public decimal CigarettesAvoided(DateTime asOf) => CigarettesEquivalentPerWeek * (DaysClean(asOf) / 7m);
}
