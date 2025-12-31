namespace AspNetToolkit.Services;

/// <summary>
/// Defines methods for validating user sessions.
/// </summary>
public interface ISessionValidationService
{
    /// <summary>
    /// Asynchronously checks if the specified session is valid and has not expired.
    /// </summary>
    /// <param name="sessionId">The unique identifier of the session to validate.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a boolean indicating whether the session is valid (true) or not (false).</returns>
    Task<bool> IsSessionValidAsync(Guid sessionId);
}
