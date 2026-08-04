namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides methods for managing and testing tools.
/// </summary>
public interface IToolService
{
    /// <summary>
    /// Gets the available tools.
    /// </summary>
    /// <param name="isPersonal">
    /// <c>true</c> to retrieve personal tools; otherwise, shared tools.
    /// </param>
    /// <returns>A collection of tools.</returns>
    Task<ServiceResponse<IEnumerable<ToolDto>>> GetToolsAsync(bool isPersonal);

    /// <summary>
    /// Checks whether a tool name is available.
    /// </summary>
    /// <param name="checkAvailabilityDto">The availability check request.</param>
    /// <returns>The availability result.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsToolNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Gets a tool by its identifier.
    /// </summary>
    /// <param name="toolId">The tool identifier.</param>
    /// <returns>The requested tool.</returns>
    Task<ServiceResponse<ToolDto>> GetToolByIdAsync(Guid toolId);

    /// <summary>
    /// Creates a new tool.
    /// </summary>
    /// <param name="toolDto">The tool details.</param>
    /// <returns>The created tool.</returns>
    Task<ServiceResponse<ToolDto>> InsertToolAsync(ToolDto toolDto);

    /// <summary>
    /// Updates an existing tool.
    /// </summary>
    /// <param name="toolDto">The updated tool details.</param>
    /// <returns>The updated tool.</returns>
    Task<ServiceResponse<ToolDto>> UpdateToolAsync(ToolDto toolDto);

    /// <summary>
    /// Deletes a tool.
    /// </summary>
    /// <param name="toolId">The tool identifier.</param>
    /// <returns><c>true</c> if the tool was deleted successfully; otherwise, <c>false</c>.</returns>
    Task<ServiceResponse<bool>> DeleteToolAsync(Guid toolId);

    /// <summary>
    /// Deletes the specified tools.
    /// </summary>
    /// <param name="toolIds">The identifiers of the tools to delete.</param>
    /// <returns>
    /// <c>true</c> if the tools were deleted successfully; otherwise, <c>false</c>.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteToolsAsync(List<Guid> toolIds);

    /// <summary>
    /// Tests a tool operation.
    /// </summary>
    /// <param name="toolId">The tool identifier.</param>
    /// <param name="testToolDto">The test request.</param>
    /// <returns>The test result.</returns>
    Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(Guid toolId, TestToolDto testToolDto);

    /// <summary>
    /// Activates or deactivates a tool.
    /// </summary>
    /// <param name="toolId">The tool identifier.</param>
    /// <param name="isActive"><c>true</c> to activate; <c>false</c> to deactivate.</param>
    /// <returns>The updated tool.</returns>
    Task<ServiceResponse<ToolDto>> SetToolActiveStateAsync(Guid toolId, bool isActive);

    /// <summary>
    /// Gets all platform (library) tools available to the current tenant.
    /// </summary>
    /// <returns>A collection of library tools.</returns>
    Task<ServiceResponse<IEnumerable<ToolDto>>> GetLibraryToolsAsync();
}