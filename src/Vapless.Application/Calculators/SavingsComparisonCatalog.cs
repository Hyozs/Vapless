using System.Globalization;
using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;

namespace Vapless.Application.Calculators;

public sealed class SavingsComparisonCatalog : ISavingsComparisonCatalog
{
    private static readonly (string Name, decimal Target)[] Goals =
    [
        ("dos combos de cine", 40_000m),
        ("una hamburguesa doble en la 70", 28_000m),
        ("una camiseta", 60_000m),
        ("un par de tenis", 180_000m),
        ("unos audífonos", 250_000m),
        ("una bici para el barrio", 900_000m),
        ("un computador para estudiar", 1_800_000m)
    ];

    public string BuildPhrase(decimal amountCop)
    {
        if (amountCop <= 0)
        {
            return "Apenas vas arrancando: tu primer día ya cuenta.";
        }

        var reached = Goals.Where(g => g.Target <= amountCop).OrderByDescending(g => g.Target).FirstOrDefault();
        if (reached.Target > 0)
        {
            return $"Con los {FormatCop(amountCop)} que llevás ahorrados ya podés pensar en {reached.Name}.";
        }

        var next = Goals.OrderBy(g => g.Target).First();
        var missing = next.Target - amountCop;
        return $"Ya vas por {FormatCop(amountCop)}. Te faltan {FormatCop(missing)} para {next.Name}.";
    }

    public IReadOnlyList<SavingsGoalDto> BuildGoalProgress(decimal amountCop)
    {
        return Goals.Select(goal =>
        {
            var percent = goal.Target <= 0 ? 0 : (int)Math.Clamp(Math.Round(amountCop / goal.Target * 100), 0, 100);
            return new SavingsGoalDto(goal.Name, goal.Target, amountCop >= goal.Target, percent);
        }).ToList();
    }

    private static string FormatCop(decimal amount) =>
        amount.ToString("C0", CultureInfo.GetCultureInfo("es-CO"));
}
