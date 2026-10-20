using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/assessment")]
public sealed class AssessmentController : ControllerBase
{
    private readonly IAssessmentService _assessment;

    public AssessmentController(IAssessmentService assessment) => _assessment = assessment;

    [HttpGet("questions")]
    public async Task<ActionResult<AssessmentQuestionsDto>> Questions(CancellationToken ct) =>
        Ok(await _assessment.GetQuestionsAsync(ct));

    [HttpPost("evaluate")]
    public async Task<ActionResult<AssessmentResultDto>> Evaluate(
        [FromBody] AssessmentSubmissionDto submission,
        CancellationToken ct)
    {
        return Ok(await _assessment.EvaluateAsync(submission, ct));
    }
}
