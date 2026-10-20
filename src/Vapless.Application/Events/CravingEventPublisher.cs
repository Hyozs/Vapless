using Vapless.Domain.Entities;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Events;

public sealed class CravingEventPublisher : ICravingEventPublisher
{
    private readonly IEnumerable<ICravingObserver> _observers;

    public CravingEventPublisher(IEnumerable<ICravingObserver> observers) => _observers = observers;

    public async Task<IReadOnlyList<string>> PublishAsync(
        Craving log,
        UserProgress profile,
        CancellationToken ct = default)
    {
        var messages = new List<string>();
        foreach (var observer in _observers)
        {
            ct.ThrowIfCancellationRequested();
            messages.AddRange(await observer.OnCravingOvercameAsync(log, profile, ct));
        }

        return messages;
    }
}

