namespace AccountsAPIs.Services;
public interface IAuditLogService
{

    /// <summary>
    /// Inserts a new audit log.
    /// </summary>
    /// <param name="AuditLogDto">The data required to insert the log.</param>
    /// <returns>The task result contains the service response with the inserted log details.</returns>
    Task<ServiceResponse<AuditLogDto>> InsertLogAsync(AuditLogDto AuditLogDto);

    ///<summary>
    /// Delete audit log by its ID.
    /// </summary>
    /// <param name="id">The data required to delete the log.</param>
    /// <returns>The task result contains the service response with the delete log details.</returns>

    Task<ServiceResponse<bool>> DeleteLogAsync(Guid id);
}