using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/progress")]
public sealed class ProgressController : ControllerBase
{
    private readonly IProfileService _profiles;
    private readonly ISavingsService _savings;
    private readonly INicotineProfileService _nicotine;

    public ProgressController(
        IProfileService profiles,
        ISavingsService savings,
        INicotineProfileService nicotine)
    {
        _profiles = profiles;
        _savings = savings;
        _nicotine = nicotine;
    }

    [HttpGet]
    public async Task<ActionResult<ProfileDto>> Current(
        [FromQuery] int? profileId,
        CancellationToken ct)
    {
        return Ok(await _profiles.GetCurrentAsync(profileId, ct));
    }

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> Update(
        [FromBody] ProfileUpsertDto update,
        CancellationToken ct)
    {
        return Ok(await _profiles.UpdateAsync(update, ct));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<SavingsSummaryDto>> Summary(
        [FromQuery] int? profileId,
        CancellationToken ct)
    {
        return Ok(await _savings.GetSummaryAsync(profileId, ct));
    }

    [HttpGet("nicotine")]
    public async Task<ActionResult<NicotineProfileDto>> Nicotine(
        [FromQuery] int? profileId,
        CancellationToken ct)
    {
        return Ok(await _nicotine.GetAsync(profileId, ct));
    }
}
