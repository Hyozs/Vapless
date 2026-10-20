using Vapless.Domain.Common;

namespace Vapless.Domain.Entities;

public class SupportHotline : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Schedule { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Scope { get; set; } = "Medellín";
    public int SortOrder { get; set; }
}
