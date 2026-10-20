using Vapless.Domain.Common;
using Vapless.Domain.Enums;

namespace Vapless.Domain.Entities;

public class RiskSurvey : BaseEntity
{
    public ComunaMedellin Comuna { get; set; }
    public int Age { get; set; }
    public DeviceType PrimaryDevice { get; set; }
    public int FrequencyPerDay { get; set; }
    public bool UsesInSchool { get; set; }
    public EmotionalTrigger Trigger { get; set; }
    public FamilyContext FamilyContext { get; set; }
    public bool Synthetic { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
