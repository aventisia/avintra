using System.Text.Json;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Describes a single Corsair operation exposed by the sidecar tool listing endpoint.
/// </summary>
public sealed class CorsairToolDescriptor
{
    /// <summary>
    /// Fully-qualified operation path, e.g. "github.issues.create".
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// Plugin identifier (first segment of <see cref="Path"/>).
    /// </summary>
    public string Plugin { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable operation description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Structured input schema for the operation.
    /// </summary>
    public JsonElement? Input { get; set; }

    /// <summary>
    /// Structured output schema for the operation.
    /// </summary>
    public JsonElement? Output { get; set; }
}

/// <summary>
/// Client for the Corsair sidecar used to lazy-seed platform tools and mirror API-key credentials.
/// </summary>
public interface ICorsairSidecarService
{
    /// <summary>
    /// Retrieves all available tools from the Corsair sidecar.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of Corsair tool descriptors.</returns>
    Task<IReadOnlyList<CorsairToolDescriptor>> GetToolsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Mirrors an API-key credential into the Corsair sidecar.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id).</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="apiKey">API key value to store.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><c>true</c> when the sidecar acknowledged the mirror.</returns>
    Task<bool> MirrorCredentialAsync(Guid connectionId, string plugin, string apiKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears a mirrored API-key credential from the Corsair sidecar.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id).</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><c>true</c> when the sidecar acknowledged the delete.</returns>
    Task<bool> DeleteCredentialAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default);
}
