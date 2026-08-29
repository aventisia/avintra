namespace WorkspaceAPIs.Services;

/// <summary>
/// In-memory, thread-safe store for agent builder collaboration state (presence + locks).
/// Locks carry a server-side TTL and are lazily swept on access.
/// </summary>
public class CollaborationStore : ICollaborationStore
{
    /// <summary>
    /// Default lock lifetime before it expires (server-side TTL).
    /// </summary>
    public static readonly TimeSpan DefaultLockTtl = TimeSpan.FromSeconds(60);

    // Presence keyed by connection id (a user may have multiple tabs/connections).
    private readonly ConcurrentDictionary<string, PresenceDto> _presenceByConnection = new();

    // Locks keyed by LockKey = $"{flowVersionId}:{targetType}:{targetId}".
    private readonly ConcurrentDictionary<string, LockDto> _locks = new();

    public Task AddPresenceAsync(PresenceDto presence)
    {
        _presenceByConnection[presence.ConnectionId ?? string.Empty] = presence;
        return Task.CompletedTask;
    }

    public Task<PresenceDto?> RemovePresenceByConnectionIdAsync(string connectionId)
    {
        _presenceByConnection.TryRemove(connectionId, out var presence);
        return Task.FromResult(presence);
    }

    public Task<IEnumerable<PresenceDto>> GetPresenceForFlowAsync(Guid flowVersionId)
    {
        var presence = _presenceByConnection.Values
            .Where(p => p.FlowVersionId == flowVersionId)
            .ToList();
        return Task.FromResult<IEnumerable<PresenceDto>>(presence);
    }

    public Task<LockDto?> TryAcquireLockAsync(LockDto lockDto)
    {
        // Lazily drop any expired lock for this key before attempting to acquire.
        if (_locks.TryGetValue(lockDto.LockKey, out var existing))
        {
            if (existing.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                _locks.TryRemove(lockDto.LockKey, out _);
            }
            else if (existing.HolderUserId != lockDto.HolderUserId)
            {
                // Held by another user and not expired → reject.
                return Task.FromResult<LockDto?>(null);
            }
        }

        var acquired = new LockDto
        {
            LockKey = lockDto.LockKey,
            FlowVersionId = lockDto.FlowVersionId,
            TargetType = lockDto.TargetType,
            TargetId = lockDto.TargetId,
            HolderUserId = lockDto.HolderUserId,
            HolderDisplayName = lockDto.HolderDisplayName,
            AcquiredAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.Add(DefaultLockTtl),
        };

        _locks[lockDto.LockKey] = acquired;
        return Task.FromResult<LockDto?>(acquired);
    }

    public Task<bool> RefreshLockAsync(string lockKey, string holderUserId)
    {
        if (!_locks.TryGetValue(lockKey, out var existing)) return Task.FromResult(false);
        if (existing.HolderUserId != holderUserId) return Task.FromResult(false);
        if (existing.ExpiresAt <= DateTimeOffset.UtcNow) return Task.FromResult(false);

        existing.ExpiresAt = DateTimeOffset.UtcNow.Add(DefaultLockTtl);
        return Task.FromResult(true);
    }

    public Task<bool> ReleaseLockAsync(string lockKey, string holderUserId)
    {
        if (!_locks.TryGetValue(lockKey, out var existing)) return Task.FromResult(false);
        if (existing.HolderUserId != holderUserId) return Task.FromResult(false);

        _locks.TryRemove(lockKey, out _);
        return Task.FromResult(true);
    }

    public Task<bool> ForceReleaseLockAsync(string lockKey)
    {
        return Task.FromResult(_locks.TryRemove(lockKey, out _));
    }

    public Task<IEnumerable<LockDto>> GetLocksForFlowAsync(Guid flowVersionId)
    {
        var now = DateTimeOffset.UtcNow;
        var active = _locks.Values
            .Where(l => l.FlowVersionId == flowVersionId && l.ExpiresAt > now)
            .ToList();

        // Lazily sweep expired locks for this flow.
        foreach (var expired in _locks.Values.Where(l => l.FlowVersionId == flowVersionId && l.ExpiresAt <= now))
        {
            _locks.TryRemove(expired.LockKey, out _);
        }

        return Task.FromResult<IEnumerable<LockDto>>(active);
    }

    public Task<IEnumerable<LockDto>> ReleaseAllLocksForUserAsync(string userId)
    {
        var released = _locks.Values
            .Where(l => l.HolderUserId == userId)
            .ToList();

        foreach (var lockDto in released)
        {
            _locks.TryRemove(lockDto.LockKey, out _);
        }

        return Task.FromResult<IEnumerable<LockDto>>(released);
    }
}
