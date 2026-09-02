namespace RunnerApp.Services;

/// <summary>
/// Wires the machine-JWT refresh plumbing shared by console server mode and worker mode:
/// a fixed-token refresh client that renews via <c>machine-auth/validate</c>, a
/// <see cref="MachineTokenManager"/> built from the initial JWT, and a token-manager-backed
/// <see cref="BackendHttpClient"/> whose calls always carry the freshest token.
/// </summary>
public static class RunnerClientFactory
{
    public sealed record RunnerClients(MachineTokenManager? TokenManager, BackendHttpClient BackendClient);

    /// <summary>
    /// Builds a refresh client + token manager + backend client from an initial access token.
    /// <paramref name="registrationUsername"/> is the username the machine was registered under
    /// (the service account when launched by the Windows service); the backend resolves the
    /// machine record with it during validate. Returns a null token manager when no JWT is
    /// supplied, in which case the backend client uses the fixed token.
    /// </summary>
    public static RunnerClients Create(HttpClient httpClient, string accessToken, string? registrationUsername = null)
    {
        var refreshClient = new BackendHttpClient(httpClient, accessToken);
        var tokenManager = MachineTokenManager.TryCreateFromJwt(
            accessToken,
            (currentJwt, ct) => refreshClient.ValidateMachineAsync(
                currentJwt, MachineIdentity.OsId, registrationUsername ?? MachineIdentity.Username, ct),
            logger: null);

        var backendClient = tokenManager is not null
            ? new BackendHttpClient(httpClient, tokenManager)
            : new BackendHttpClient(httpClient, accessToken);

        return new RunnerClients(tokenManager, backendClient);
    }
}