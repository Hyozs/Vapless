using Microsoft.AspNetCore.Mvc;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Api.Controllers;

[ApiController]
[Route("api/v1/hack")]
public sealed class HackController : ControllerBase
{
    private readonly IHackService _service;

    public HackController(IHackService service) => _service = service;

    [HttpGet("decks")]
    public async Task<ActionResult<IReadOnlyList<HackDeckDto>>> Decks(CancellationToken ct) =>
        Ok(await _service.GetDecksAsync(ct));

    [HttpGet("decks/{category:int}")]
    public async Task<ActionResult<HackDeckDto>> Deck(int category, CancellationToken ct)
    {
        var deck = await _service.GetDeckAsync(category, ct);
        return deck is null ? NotFound(new { error = "Ese mazo no existe." }) : Ok(deck);
    }

    [HttpPost("cards/{id:int}/answer")]
    public async Task<ActionResult<HackAnswerResultDto>> Answer(
        int id,
        [FromBody] HackAnswerDto answer,
        CancellationToken ct)
    {
        var result = await _service.AnswerAsync(id, answer, ct);
        return result is null ? NotFound(new { error = "Esa tarjeta no existe." }) : Ok(result);
    }
}
