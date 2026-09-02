namespace RunnerApp.Services;

/// <summary>
/// Holds the current machine JWT and refreshes it through a caller-provided delegate before it
/// expires. Long-lived runners (Windows service, worker processes) call
/// <see cref="GetValidTokenAsync"/> before every backend interaction so they never present an
/// expired JWT to the OrchestratorHub or REST endpoints — previously an expired token made the
/// machine show Offline until the service was restarted.
///
/// The refresh delegate receives the current (still valid) JWT so worker processes can renew
/// their token via <c>machine-auth/validate</c> without holding the tenant API key; the service
/// uses the API-key registration endpoint instead and ignores the passed token.
/// </summary>
public sealed class MachineTokenManager
{
    // Refresh when at most this much validity remains, so a transient refresh failure still
    // leaves time to retry before the token actually expires.
    public static readonly TimeSpan RefreshThreshold = TimeSpan.FromMinutes(15);

    private readonly Func<string, CancellationToken, Task<MachineRegistrationResult?>> _refresh;
    private readonly ILogger? _logger;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);

    private string _jwt;
    private DateTimeOffset _expiresOn;

    public MachineTokenManager(
        MachineRegistrationResult initial,
        Func<string, CancellationToken, Task<MachineRegistrationResult?>> refresh,
        ILogger? logger = null)
    {
        _jwt = initial.Jwt;
        _expiresOn = initial.ExpiresOn;
        MachineId = initial.MachineId;
        _refresh = refresh;
        _logger = logger;
    }

    public Guid MachineId { get; private set; }

    public DateTimeOffset ExpiresOn => _expiresOn;

    // Bumped on every successful refresh so consumers can detect that the token changed
    // (e.g. the service rebuilds its hub connection with the new handshake token).
    public int Version { get; private set; }

    // True when the token is expired or inside the refresh-threshold window.
    public bool IsRefreshDue => _expiresOn - DateTimeOffset.UtcNow <= RefreshThreshold;

    /// <summary>
    /// Returns the current JWT, refreshing it first when it is expired or expires within the
    /// refresh threshold. Refreshes are single-flight: concurrent callers share one refresh.
    /// A failed refresh never fails the caller while the existing token is still valid; the
    /// token is returned and the next call retries. When the token has already expired and the
    /// refresh also fails, an <see cref="InvalidOperationException"/> is thrown — a stale token
    /// would only surface as a cryptic 401 downstream.
    /// </summary>
    public async Task<string> GetValidTokenAsync(CancellationToken ct = default)
    {
        if (!IsRefreshDue)
            return _jwt;

        // WaitAsync may be cancelled before the semaphore is acquired; only release what we own.
        var acquired = false;
        try
        {
            await _refreshLock.WaitAsync(ct);
            acquired = true;

            // Re-check under the lock: another caller may have refreshed while we waited.
            if (!IsRefreshDue)
                return _jwt;

            DebugLog.Info("Machine JWT is expired or expiring soon; refreshing.");
            var registration = await _refresh(_jwt, ct);
            if (registration is null || string.IsNullOrWhiteSpace(registration.Jwt))
            {
                if (_expiresOn <= DateTimeOffset.UtcNow)
                    throw new InvalidOperationException("Machine JWT expired and the refresh call returned no token.");

                DebugLog.Warn("Machine JWT refresh returned no token; keeping the current token and retrying on the next backend call.");
                return _jwt;
            }

            _jwt = registration.Jwt;
            _expiresOn = registration.ExpiresOn;
            MachineId = registration.MachineId;
            Version++;
            DebugLog.Info($"Machine JWT refreshed. New expiry: {registration.ExpiresOn:O}.");
            return _jwt;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            // Swallow transient refresh failures while the current token is still valid so
            // callers ride out backend outages; fail fast once it has already expired.
            if (_expiresOn <= DateTimeOffset.UtcNow)
                throw new InvalidOperationException("Machine JWT expired and the refresh call failed.", ex);

            DebugLog.Error("Machine JWT refresh failed; keeping the current token and retrying on the next backend call.", ex);
            _logger?.LogWarning(ex, "Machine JWT refresh failed; returning the existing token.");
            return _jwt;
        }
        finally
        {
            if (acquired)
                _refreshLock.Release();
        }
    }

    /// <summary>
    /// Creates a manager from a raw JWT (worker mode), reading its <c>exp</c> claim for the
    /// expiry since the launcher passes only the token string. Returns null when no token is
    /// provided. If the expiry cannot be parsed it defaults to now, forcing a refresh on the
    /// first call.
    /// </summary>
    public static MachineTokenManager? TryCreateFromJwt(
        string? jwt,
        Func<string, CancellationToken, Task<MachineRegistrationResult?>> refresh,
        ILogger? logger = null)
    {
        if (string.IsNullOrWhiteSpace(jwt))
            return null;

        var expiresOn = JwtUtils.TryReadExpiry(jwt) ?? DateTimeOffset.UtcNow;
        return new MachineTokenManager(new MachineRegistrationResult(Guid.Empty, jwt, expiresOn), refresh, logger);
    }
}