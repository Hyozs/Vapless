using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class SupportService : ISupportService
{
    private readonly ISupportHotlineRepository _hotlines;

    public SupportService(ISupportHotlineRepository hotlines) => _hotlines = hotlines;

    public async Task<IReadOnlyList<SupportHotlineDto>> GetHotlinesAsync(CancellationToken ct = default)
    {
        var hotlines = await _hotlines.ListAsync(ct);
        return hotlines
            .OrderBy(h => h.SortOrder)
            .Select(h => new SupportHotlineDto(h.Name, h.Phone, h.Schedule, h.Description, h.Scope))
            .ToList();
    }
}
