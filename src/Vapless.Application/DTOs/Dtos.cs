namespace Vapless.Application.DTOs;

public record ProfileDto(
    int Id,
    string Alias,
    DateTime QuitDate,
    decimal DailyCostCop,
    decimal NicotineMgPerPod,
    int PodsPerWeek,
    int PrimaryDevice,
    string PodTypeName,
    decimal PodCostCop,
    decimal CigarettesPerPod,
    string PodNote);

public record ProfileUpsertDto(
    string? Alias,
    DateTime? QuitDate,
    decimal? DailyCostCop,
    decimal? NicotineMgPerPod,
    int? PodsPerWeek,
    int? PrimaryDevice);

public record CravingRequestDto(
    int Intensity,
    int MinutesResisted,
    string? StrategyUsed,
    int? Trigger,
    int? ProfileId);

public record CravingResultDto(
    int Id,
    int DaysClean,
    decimal TotalCopSaved,
    decimal NicotineMgAvoidedMg,
    string Headline,
    IReadOnlyList<string> Messages,
    InterventionDto Intervention);

public record InterventionDto(
    string Code,
    string Title,
    string Instructions,
    bool SuggestSupport);

public record CravingHistoryItemDto(
    int Id,
    DateTime OccurredAt,
    int Intensity,
    int MinutesResisted,
    bool Overcome,
    string StrategyUsed,
    string Trigger);

public record SavingsSummaryDto(
    int DaysClean,
    decimal TotalCopSaved,
    decimal NicotineMgAvoidedMg,
    decimal DailyCostCop,
    string CopComparisonPhrase,
    string NicotinePhrase,
    IReadOnlyList<SavingsGoalDto> NextGoals,
    NicotineProfileDto Nicotine);

public record NicotineProfileDto(
    int PodType,
    string PodTypeName,
    decimal NicotineMgPerPod,
    decimal CigarettesPerPod,
    decimal PodCostCop,
    int PodsPerWeek,
    decimal WeeklyNicotineMg,
    decimal DailyNicotineMg,
    decimal WeeklyCigarettes,
    decimal NicotineIngestedMg,
    decimal NicotineAvoidedMg,
    decimal CigarettesAvoided,
    decimal WeeklyCostCop,
    decimal CopSaved,
    string Phrase);

public record SavingsGoalDto(
    string Name,
    decimal TargetCop,
    bool Reached,
    int ProgressPercent);

public record SurveySubmissionDto(
    int ComunaCode,
    int Age,
    int DeviceType,
    int FrequencyPerDay,
    bool UsesInSchool,
    int Trigger,
    int FamilyContext);

public record SurveyAcceptedDto(
    bool Accepted,
    string Message,
    int ComunaCode,
    string ComunaName);

public record ComunaRiskResultDto(
    int ComunaCode,
    string ComunaName,
    double RiskIndex,
    int TotalResponses,
    bool HasSufficientData,
    string RiskLevel,
    IReadOnlyList<string> ExplainableReasons);

public record ComunaRiskMapDto(
    DateTime GeneratedAt,
    int KAnonymity,
    int TotalSurveys,
    IReadOnlyList<ComunaRiskResultDto> Comunas,
    IReadOnlyList<string> TopTriggers);

public record PsychoSocialInsightDto(
    string Title,
    string Finding,
    string Recommendation,
    bool HasSufficientData);

public record PsychoSocialAnalysisDto(
    int TotalSurveys,
    int KAnonymity,
    IReadOnlyList<PsychoSocialInsightDto> Insights);

public record HackCardDto(
    int Id,
    int Category,
    string CategoryName,
    string Statement,
    string Explanation,
    int XpReward,
    int SortOrder);

public record HackDeckDto(
    int Category,
    string Name,
    int CardCount,
    IReadOnlyList<HackCardDto> Cards);

public record HackAnswerDto(bool AnswerIsMyth);

public record HackAnswerResultDto(
    bool Correct,
    string Feedback,
    string Explanation,
    int XpEarned,
    string SupportPrompt);

public record SocialScenarioDto(
    int Id,
    string Title,
    string Context,
    string PeerPhrase,
    string Trigger,
    int Difficulty,
    IReadOnlyList<AssertiveResponseDto> Responses);

public record AssertiveResponseDto(
    string Strategy,
    string Text);

public record SupportHotlineDto(
    string Name,
    string Phone,
    string Schedule,
    string Description,
    string Scope);

public record AssessmentOptionDto(string Id, string Label, int Value);

public record AssessmentQuestionDto(
    string Id,
    string Dimension,
    string DimensionLabel,
    string Prompt,
    string Helper,
    IReadOnlyList<AssessmentOptionDto> Options);

public record AssessmentQuestionsDto(int Total, IReadOnlyList<AssessmentQuestionDto> Questions);

public record AssessmentAnswerDto(string QuestionId, string OptionId);

public record AssessmentSubmissionDto(IReadOnlyList<AssessmentAnswerDto> Answers);

public record AssessmentDimensionResultDto(string Dimension, string Label, int Score, string Finding);

public record AssessmentSupportLineDto(string Name, string Phone, string Description, bool IsEmergency);

public record AssessmentResultDto(
    int Score,
    string Level,
    string LevelLabel,
    string Headline,
    bool RequiresSupport,
    IReadOnlyList<AssessmentDimensionResultDto> Dimensions,
    IReadOnlyList<string> Findings,
    IReadOnlyList<string> Recommendations,
    IReadOnlyList<AssessmentSupportLineDto> SupportLines);
