using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/cravings")]
public sealed class CravingController : ControllerBase
{
    private readonly ICravingService _service;

    public CravingController(ICravingService service) => _service = service;

    [HttpPost]
    public async Task<ActionResult<CravingResultDto>> Register(
        [FromBody] CravingRequestDto request,
        CancellationToken ct)
    {
        var result = await _service.RegisterAsync(request, ct);
        return Created($"/api/v1/cravings/{result.Id}", result);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CravingHistoryItemDto>>> History(
        [FromQuery] int profileId = 1,
        CancellationToken ct = default)
    {
        return Ok(await _service.GetHistoryAsync(profileId, ct));
    }
}
