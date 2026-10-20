using Vapless.Domain.Entities;

namespace Vapless.Domain.Interfaces;

public interface IRiskRule
{
    string Code { get; }
    string Name { get; }
    RiskContribution Evaluate(RiskSurvey survey);
}

public sealed record RiskContribution(double Points, string Reason)
{
    public static RiskContribution None(string reason) => new(0, reason);
}
