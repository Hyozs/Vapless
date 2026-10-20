using Vapless.Domain.Common;
using Vapless.Domain.Enums;

namespace Vapless.Domain.Entities;

public class SocialScenario : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
    public string PeerPhrase { get; set; } = string.Empty;
    public EmotionalTrigger Trigger { get; set; } = EmotionalTrigger.PresionSocial;
    public int Difficulty { get; set; } = 1;
}
