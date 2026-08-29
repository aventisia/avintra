namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides thread-safe, in-memory storage for collaboration state (presence and locks)
/// within the agent builder. Locks carry a server-side TTL and are lazily swept.
/// </summary>
public interface ICollaborationStore
{
    /// <summary>
    /// Adds or updates a user's presence in a flow version.
    /// </summary>
    Task AddPresenceAsync(PresenceDto presence);

    /// <summary>
    /// Removes a user's presence by connection id.
    /// </summary>
    Task<PresenceDto?> RemovePresenceByConnectionIdAsync(string connectionId);

    /// <summary>
    /// Gets all users currently present in a flow version.
    /// </summary>
    Task<IEnumerable<PresenceDto>> GetPresenceForFlowAsync(Guid flowVersionId);

    /// <summary>
    /// Attempts to acquire a lock. Returns the acquired lock, or null if it is
    /// already held by another user (or the lock key is invalid).
    /// </summary>
    Task<LockDto?> TryAcquireLockAsync(LockDto lockDto);

    /// <summary>
    /// Extends the TTL of a lock held by the given user.
    /// </summary>
    Task<bool> RefreshLockAsync(string lockKey, string holderUserId);

    /// <summary>
    /// Releases a lock if held by the given user.
    /// </summary>
    Task<bool> ReleaseLockAsync(string lockKey, string holderUserId);

    /// <summary>
    /// Force-releases a lock regardless of holder (owner/OM/TU only).
    /// </summary>
    Task<bool> ForceReleaseLockAsync(string lockKey);

    /// <summary>
    /// Gets all active (non-expired) locks for a flow version.
    /// </summary>
    Task<IEnumerable<LockDto>> GetLocksForFlowAsync(Guid flowVersionId);

    /// <summary>
    /// Releases all locks held by a given user (used on disconnect).
    /// </summary>
    Task<IEnumerable<LockDto>> ReleaseAllLocksForUserAsync(string userId);
}
