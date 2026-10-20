using Vapless.Domain.Common;
using Vapless.Domain.Enums;

namespace Vapless.Domain.Entities;

public class HackCard : BaseEntity
{
    public HackDeckCategory Category { get; set; }
    public string Statement { get; set; } = string.Empty;
    public bool IsMyth { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int XpReward { get; set; } = 10;
    public int SortOrder { get; set; }
}
