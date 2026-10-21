namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations to manage users assigned to custom UI builder projects.
/// </summary>
public interface IUiBuilderProjectUserService
{
    /// <summary>
    /// Gets UI builder project users for the current user.
    /// </summary>
    /// <returns>List of UI builder project users.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> GetMyUiBuilderProjectUsersAsync();

    /// <summary>
    /// Gets all users assigned to a specific UI builder project.
    /// </summary>
    /// <param name="uiBuilderProjectId">The UI builder project ID.</param>
    /// <returns>List of UI builder project users.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> GetUiBuilderProjectUsersAsync(Guid uiBuilderProjectId);

    /// <summary>
    /// Gets a UI builder project user by ID.
    /// </summary>
    /// <param name="uiBuilderProjectUserId">The UI builder project user ID.</param>
    /// <returns>The UI builder project user details.</returns>
    Task<ServiceResponse<UiBuilderProjectUserDto>> GetUiBuilderProjectUserByIdAsync(Guid uiBuilderProjectUserId);

    /// <summary>
    /// Creates a new UI builder project user.
    /// </summary>
    /// <param name="uiBuilderProjectUserDto">The UI builder project user data.</param>
    /// <returns>The created UI builder project user.</returns>
    Task<ServiceResponse<UiBuilderProjectUserDto>> InsertUiBuilderProjectUserAsync(UiBuilderProjectUserDto uiBuilderProjectUserDto);

    /// <summary>
    /// Creates multiple UI builder project users in a single operation.
    /// </summary>
    /// <param name="uiBuilderProjectUserDtos">List of UI builder project user data.</param>
    /// <returns>List of created UI builder project users.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> BulkInsertUiBuilderProjectUsersAsync(IEnumerable<UiBuilderProjectUserDto> uiBuilderProjectUserDtos);

    /// <summary>
    /// Updates an existing UI builder project user.
    /// </summary>
    /// <param name="uiBuilderProjectUserDto">The updated UI builder project user data.</param>
    /// <returns>The updated UI builder project user.</returns>
    Task<ServiceResponse<UiBuilderProjectUserDto>> UpdateUiBuilderProjectUserAsync(UiBuilderProjectUserDto uiBuilderProjectUserDto);

    /// <summary>
    /// Deletes a UI builder project user by ID.
    /// </summary>
    /// <param name="uiBuilderProjectUserId">The UI builder project user ID.</param>
    /// <returns>True if deleted successfully; otherwise false.</returns>
    Task<ServiceResponse<bool>> DeleteUiBuilderProjectUserAsync(Guid uiBuilderProjectUserId);

    /// <summary>
    /// Deletes multiple UI builder project users.
    /// </summary>
    /// <param name="uiBuilderProjectUserIds">List of UI builder project user IDs.</param>
    /// <returns>True if all users were deleted successfully; otherwise false.</returns>
    Task<ServiceResponse<bool>> DeleteUiBuilderProjectUsersAsync(IEnumerable<Guid> uiBuilderProjectUserIds);
}
