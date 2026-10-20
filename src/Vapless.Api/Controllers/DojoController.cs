using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/dojo")]
public sealed class DojoController : ControllerBase
{
    private readonly IDojoService _service;

    public DojoController(IDojoService service) => _service = service;

    [HttpGet("scenarios")]
    public async Task<ActionResult<IReadOnlyList<SocialScenarioDto>>> Scenarios(CancellationToken ct) =>
        Ok(await _service.GetScenariosAsync(ct));
}
