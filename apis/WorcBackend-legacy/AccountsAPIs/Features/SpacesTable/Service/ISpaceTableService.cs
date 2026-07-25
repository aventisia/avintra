namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing spaces and their related users.
/// </summary>
public interface ISpaceTableService
{
    /// <summary>
    /// Retrieves all spaces in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of all <see cref="SpaceTableDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SpaceTableDto>>> GetAllSpacesAsync();

    /// <summary>
    /// Retrieves a list of spaces formatted as selectable options, typically used in dropdowns or selection lists.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOption"/> representing available space options.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSpaceOptionsAsync();

    /// <summary>
    /// Retrieves the details of a specific space by its unique identifier.
    /// </summary>
    /// <param name="spaceId">The unique identifier of the space.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="SpaceTableDto"/> if found.
    /// </returns>
    Task<ServiceResponse<SpaceTableDto>> GetSpaceByIdAsync(Guid spaceId);

    /// <summary>
    /// Creates a new space with the provided details.
    /// </summary>
    /// <param name="spaceDto">The data required to create the new space.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="SpaceTableDto"/>.
    /// </returns>
    Task<ServiceResponse<SpaceTableDto>> CreateSpaceAsync(SpaceDto spaceDto);

    /// <summary>
    /// Updates the information of an existing space.
    /// </summary>
    /// <param name="spaceDto">The updated space data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="SpaceTableDto"/>.
    /// </returns>
    Task<ServiceResponse<SpaceTableDto>> UpdateSpaceAsync(SpaceDto spaceDto);

    /// <summary>
    /// Deletes a specific space by its unique identifier.
    /// </summary>
    /// <param name="spaceId">The unique identifier of the space to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteSpaceAsync(Guid spaceId);

    /// <summary>
    /// Deletes multiple spaces identified by a list of unique identifiers.
    /// </summary>
    /// <param name="spaceIds">A list of space IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates the success of the batch deletion.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteSpacesAsync(List<Guid> spaceIds);

    /// <summary>
    /// Retrieves all users associated with a specific space.
    /// </summary>
    /// <param name="spaceId">The unique identifier of the space.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SpaceUserDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SpaceUserDto>>> GetSpaceUsersAsync(Guid spaceId);
}