using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/surveys")]
public sealed class SurveyController : ControllerBase
{
    private readonly IComunaPulseService _pulse;
    private readonly IPsychoSocialAnalysisService _analysis;

    public SurveyController(IComunaPulseService pulse, IPsychoSocialAnalysisService analysis)
    {
        _pulse = pulse;
        _analysis = analysis;
    }

    [HttpPost]
    public async Task<ActionResult<SurveyAcceptedDto>> Submit(
        [FromBody] SurveySubmissionDto submission,
        CancellationToken ct)
    {
        var result = await _pulse.SubmitAsync(submission, ct);
        return Ok(result);
    }

    [HttpGet("risk-map")]
    public async Task<ActionResult<ComunaRiskMapDto>> RiskMap(CancellationToken ct) =>
        Ok(await _pulse.GetRiskMapAsync(ct));

    [HttpGet("analysis")]
    public async Task<ActionResult<PsychoSocialAnalysisDto>> Analysis(CancellationToken ct) =>
        Ok(await _analysis.GetAnalysisAsync(ct));

    [HttpGet("comunas")]
    public ActionResult<IEnumerable<object>> Comunas() =>
        Ok(ComunaCatalog.All
            .OrderBy(c => (int)c)
            .Select(c => new { code = (int)c, name = ComunaCatalog.GetName(c) }));
}
