using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;

namespace Vapless.Application.Strategies;

public sealed class SwipeEvaluationStrategy : ISwipeEvaluationStrategy
{
    public HackAnswerResultDto Evaluate(HackCard card, bool answerIsMyth)
    {
        var correct = answerIsMyth == card.IsMyth;
        var feedback = correct
            ? "¡De una! Eso lo tenías claro."
            : "Uy, casi. Mirá cómo es la cosa:";

        return new HackAnswerResultDto(
            correct,
            feedback,
            card.Explanation,
            correct ? card.XpReward : 0,
            "Esto no es un examen ni un reporte. Si querés hablarlo con alguien, la Línea Amiga 106 está disponible 24/7.");
    }
}
