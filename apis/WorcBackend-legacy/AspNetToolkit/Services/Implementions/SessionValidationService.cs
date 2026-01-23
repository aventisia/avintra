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

        // Check if the session exists in the database
        var sessionExists = await _tenantDbContext.ReadOnlyActiveSessions
            .AsNoTracking()
            .AnyAsync(w => w.Id == sessionId);

        // If the session does not exist, log and return false
        if (!sessionExists)
        {
            _logger.LogWarning("Session with ID: {SessionId} not found in the database.", sessionId);
            return false;
        }

        // Check if the session has not expired
        var sessionIsActive = await _tenantDbContext.ReadOnlyActiveSessions
            .AsNoTracking()
            .AnyAsync(a =>
                a.Id == sessionId &&
                a.SessionExpiresOn >= DateTimeOffset.UtcNow);

        // If the session is expired, log and return false
        if (!sessionIsActive)
        {
            _logger.LogWarning("Session with ID: {SessionId} has expired.", sessionId);
            return false;
        }

        // Log a success message if the session is valid
        _logger.LogInformation("Session with ID: {SessionId} is valid.", sessionId);
        return true;
    }
}
