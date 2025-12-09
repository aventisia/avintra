namespace AspNetToolkit.Services;

public class SessionValidationService : ISessionValidationService
{
    private readonly TenantDbContext _tenantDbContext;
    private readonly ILogger<SessionValidationService> _logger;

    public SessionValidationService(TenantDbContext tenantDbContext, ILogger<SessionValidationService> logger)
    {
        _tenantDbContext = tenantDbContext;
        _logger = logger;
    }

    // Validates if a session, identified by the provided session ID, is active and not expired. A session is considered valid if it exists in the database and has not passed its expiration time.
    public async Task<bool> IsSessionValidAsync(Guid sessionId)
    {
        // Return false if the provided session ID is empty
        if (sessionId == Guid.Empty)
        {
            _logger.LogWarning("Invalid session validation attempt with an empty GUID.");
            return false;
        }

        // Log the start of the session validation process
        _logger.LogInformation("Initiating validation for session with ID: {SessionId}", sessionId);

        // Query the database for the active session using the provided session ID
        var activeSession = await _tenantDbContext.ReadOnlyActiveSessions
            .Where(x => x.Id == sessionId)
            .SingleOrDefaultAsync();

        // If no session was found in the database, return false
        if (activeSession == null)
        {
            _logger.LogWarning("Session with ID: {SessionId} not found in the database.", sessionId);
            return false;
        }

        // Check if the session has expired, and return false if it has
        if (activeSession.SessionExpiresOn < DateTimeOffset.UtcNow)
        {
            _logger.LogWarning("Session with ID: {SessionId} has expired. Expiry time: {ExpiryTime}",
                sessionId, activeSession.SessionExpiresOn);
            return false;
        }

        // Log a success message if the session is valid
        _logger.LogInformation("Session with ID: {SessionId} is valid. Expiry time: {ExpiryTime}",
            sessionId, activeSession.SessionExpiresOn);

        return true;
    }
}
