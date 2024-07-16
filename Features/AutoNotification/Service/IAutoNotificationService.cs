namespace WorkspaceAPIs.Services;

public interface IAutoNotificationService
{
    /// <summary>
    /// Inserts a new auto notification asynchronously.
    /// </summary>
    /// <param name="autoNotificationDto">The auto notification DTO.</param>
    /// <returns>A boolean value indicating whether the insertion was successful or not.</returns>
    Task<bool> InsertAutoNotificationAsync(AutoNotificationDto autoNotificationDto);

    /// <summary>
    /// Updates an auto notification asynchronously.
    /// </summary>
    /// <param name="autoNotificationDto">The auto notification DTO containing the updated information.</param>
    /// <returns>A boolean value indicating whether the update was successful or not.</returns>
    Task<bool> UpdateAutoNotificationAsync(AutoNotificationDto autoNotificationDto);

    /// <summary>
    /// Deletes an auto notification asynchronously.
    /// </summary>
    /// <param name="refId">The reference ID of the record associated with the notification to delete.</param>
    /// <returns>A boolean value indicating whether the deletion was successful.</returns>
    Task<bool> DeleteAutoNotificationAsync(Guid refId);
}