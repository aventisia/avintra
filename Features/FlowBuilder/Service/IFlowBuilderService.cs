namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing flow builder feature.
/// </summary>
public interface IFlowBuilderService
{
    /// <summary>
    /// Retrieves the flow record to load when the user opens it in the studio.
    /// </summary>
    /// <param name="id">The ID of the flow record (Primary Key).</param>
    /// <returns>The task result contains the service response with the flow properties required for the studio on load.</returns>
    Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid id);
}