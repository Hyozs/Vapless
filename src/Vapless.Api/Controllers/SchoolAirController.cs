using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/school-air")]
public sealed class SchoolAirController : ControllerBase
{
    private readonly ISchoolAirService _service;

    public SchoolAirController(ISchoolAirService service) => _service = service;

    [HttpGet("metrics")]
    public async Task<ActionResult<IReadOnlyList<SchoolAirReadingDto>>> Metrics(CancellationToken ct) =>
        Ok(await _service.GetLatestAsync(ct));
}
