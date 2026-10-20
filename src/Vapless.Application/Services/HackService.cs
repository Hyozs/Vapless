using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Enums;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class HackService : IHackService
{
    private readonly IHackCardRepository _cards;
    private readonly ISwipeEvaluationStrategy _evaluator;

    public HackService(IHackCardRepository cards, ISwipeEvaluationStrategy evaluator)
    {
        _cards = cards;
        _evaluator = evaluator;
    }

    public async Task<IReadOnlyList<HackDeckDto>> GetDecksAsync(CancellationToken ct = default)
    {
        var cards = await _cards.ListAsync(ct);
        return cards
            .GroupBy(c => c.Category)
            .OrderBy(g => (int)g.Key)
            .Select(ToDeck)
            .ToList();
    }

    public async Task<HackDeckDto?> GetDeckAsync(int category, CancellationToken ct = default)
    {
        if (!Enum.IsDefined(typeof(HackDeckCategory), category))
        {
            return null;
        }

        var cards = await _cards.ListAsync(ct);
        var group = cards.Where(c => (int)c.Category == category).OrderBy(c => c.SortOrder).ToList();
        return group.Count == 0 ? null : ToDeck(group.GroupBy(c => c.Category).First());
    }

    public async Task<HackAnswerResultDto?> AnswerAsync(int cardId, HackAnswerDto answer, CancellationToken ct = default)
    {
        var card = await _cards.GetAsync(cardId, ct);
        return card is null ? null : _evaluator.Evaluate(card, answer.AnswerIsMyth);
    }

    private static HackDeckDto ToDeck(IGrouping<HackDeckCategory, Domain.Entities.HackCard> group)
    {
        var cards = group.OrderBy(c => c.SortOrder)
            .Select(c => new HackCardDto(
                c.Id,
                (int)c.Category,
                c.Category.ToFriendlyName(),
                c.Statement,
                c.Explanation,
                c.XpReward,
                c.SortOrder))
            .ToList();

        return new HackDeckDto((int)group.Key, group.Key.ToFriendlyName(), cards.Count, cards);
    }
}
