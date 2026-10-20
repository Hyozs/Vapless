using Vapless.Domain.Common;
using Vapless.Domain.Enums;

namespace Vapless.Domain.Entities;

public class Craving : BaseEntity
{
    public int UserProgressId { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public CravingIntensity Intensity { get; set; } = CravingIntensity.Moderado;
    public int MinutesResisted { get; set; }
    public bool Overcome { get; set; } = true;
    public string StrategyUsed { get; set; } = "Respiracion478";
    public EmotionalTrigger Trigger { get; set; } = EmotionalTrigger.Curiosidad;

    public UserProgress? UserProgress { get; set; }
}
