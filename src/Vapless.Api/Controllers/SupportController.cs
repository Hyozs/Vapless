using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/support")]
public sealed class SupportController : ControllerBase
{
    private readonly ISupportService _service;

    public SupportController(ISupportService service) => _service = service;

    [HttpGet("lines")]
    public async Task<ActionResult<IReadOnlyList<SupportHotlineDto>>> Lines(CancellationToken ct) =>
        Ok(await _service.GetHotlinesAsync(ct));
}
