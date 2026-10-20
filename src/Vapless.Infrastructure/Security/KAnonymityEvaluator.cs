using Vapless.Application.Interfaces;
using Vapless.Domain.Security;

namespace Vapless.Infrastructure.Security;

public sealed class KAnonymityEvaluator : IKAnonymityEvaluator
{
    public int K => KAnonymityPolicy.K;
    public bool HasSufficientData(int sampleSize) => KAnonymityPolicy.HasSufficientData(sampleSize);
    public string MaskedMessage => KAnonymityPolicy.MaskedMessage;
}
