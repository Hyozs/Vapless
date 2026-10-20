using Vapless.Application.DTOs;
using Vapless.Domain.Entities;

namespace Vapless.Application.Interfaces;

public interface IKAnonymityEvaluator
{
    int K { get; }
    bool HasSufficientData(int sampleSize);
    string MaskedMessage { get; }
}

public interface ICravingService
{
    Task<CravingResultDto> RegisterAsync(CravingRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<CravingHistoryItemDto>> GetHistoryAsync(int profileId, CancellationToken ct = default);
}

public interface ISavingsService
{
    Task<SavingsSummaryDto> GetSummaryAsync(int? profileId, CancellationToken ct = default);
}

public interface IComunaPulseService
{
    Task<SurveyAcceptedDto> SubmitAsync(SurveySubmissionDto submission, CancellationToken ct = default);
    Task<ComunaRiskMapDto> GetRiskMapAsync(CancellationToken ct = default);
}

public interface IPsychoSocialAnalysisService
{
    Task<PsychoSocialAnalysisDto> GetAnalysisAsync(CancellationToken ct = default);
}

public interface IHackService
{
    Task<IReadOnlyList<HackDeckDto>> GetDecksAsync(CancellationToken ct = default);
    Task<HackDeckDto?> GetDeckAsync(int category, CancellationToken ct = default);
    Task<HackAnswerResultDto?> AnswerAsync(int cardId, HackAnswerDto answer, CancellationToken ct = default);
}

public interface IDojoService
{
    Task<IReadOnlyList<SocialScenarioDto>> GetScenariosAsync(CancellationToken ct = default);
}

public interface ISupportService
{
    Task<IReadOnlyList<SupportHotlineDto>> GetHotlinesAsync(CancellationToken ct = default);
}

public interface ISchoolAirService
{
    Task<IReadOnlyList<SchoolAirReadingDto>> GetLatestAsync(CancellationToken ct = default);
}

public interface IProfileService
{
    Task<ProfileDto> GetCurrentAsync(int? profileId, CancellationToken ct = default);
    Task<ProfileDto> UpdateAsync(ProfileUpsertDto update, CancellationToken ct = default);
}

public interface ISavingsComparisonCatalog
{
    string BuildPhrase(decimal amountCop);
    IReadOnlyList<SavingsGoalDto> BuildGoalProgress(decimal amountCop);
}

public interface ICravingInterventionFactory
{
    InterventionDto Create(int intensity);
}

public interface ISwipeEvaluationStrategy
{
    HackAnswerResultDto Evaluate(HackCard card, bool answerIsMyth);
}

public interface IAssertiveStrategy
{
    string Code { get; }
    string BuildResponse(SocialScenario scenario);
}
