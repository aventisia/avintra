using System.Text.Json;

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
    /// Gets the platform, personal, shared and tenant-wide tools the current user can use,
    /// within the current environment and space.
    /// </summary>
    /// <returns>A collection of usable tools.</returns>
    Task<ServiceResponse<IEnumerable<UsableToolDto>>> GetUsableToolsAsync();

    /// <summary>
    /// Gets the operations exposed by a usable tool, together with the credential type
    /// required to invoke it.
    /// </summary>
    /// <param name="toolId">The tool identifier.</param>
    /// <returns>The tool's operations and credential type.</returns>
    Task<ServiceResponse<UsableToolOperationsDto>> GetUsableToolOperationsAsync(Guid toolId);

    /// <summary>
    /// Gets the usable tools together with their enriched operations in a single payload.
    /// </summary>
    /// <returns>The usable tool catalog.</returns>
    Task<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>> GetUsableToolCatalogAsync();

    /// <summary>
    /// Gets the dynamic-config-panel node config for a custom-tool action node
    /// (<c>CustomTool/{toolName}.{operationId}</c>; legacy <c>{toolId}.{operationId}</c> still accepted), generated from the tool's OpenAPI spec.
    /// Returns the raw config document (no service-response envelope), matching
    /// the cloud-connector config-file contract; <c>null</c> when the tool or
    /// operation cannot be resolved.
    /// </summary>
    /// <param name="nodeName">The node name reference.</param>
    /// <returns>The raw node config JSON document.</returns>
    Task<JsonDocument?> GetCustomToolNodeConfigAsync(string nodeName);

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
    /// Gets a tool by its name within the current environment and tenant.
    /// </summary>
    /// <param name="toolName">The tool name.</param>
    /// <returns>The requested tool.</returns>
    Task<ServiceResponse<ToolDto>> GetToolByNameAsync(string toolName);

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
    /// Gets all platform's default tools available to the current tenant.
    /// </summary>
    /// <returns>A collection of platform's default tools.</returns>
    Task<ServiceResponse<IEnumerable<ToolDto>>> GetPlatformToolsAsync();
}