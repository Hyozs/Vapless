using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class DojoService : IDojoService
{
    private readonly ISocialScenarioRepository _scenarios;
    private readonly IEnumerable<IAssertiveStrategy> _strategies;

    public DojoService(ISocialScenarioRepository scenarios, IEnumerable<IAssertiveStrategy> strategies)
    {
        _scenarios = scenarios;
        _strategies = strategies;
    }

    public async Task<IReadOnlyList<SocialScenarioDto>> GetScenariosAsync(CancellationToken ct = default)
    {
        var scenarios = await _scenarios.ListAsync(ct);
        return scenarios
            .OrderBy(s => s.Difficulty)
            .Select(s => new SocialScenarioDto(
                s.Id,
                s.Title,
                s.Context,
                s.PeerPhrase,
                s.Trigger.ToFriendlyName(),
                s.Difficulty,
                _strategies.Select(strategy => new AssertiveResponseDto(strategy.Code, strategy.BuildResponse(s))).ToList()))
            .ToList();
    }
}
