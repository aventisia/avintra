namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// Custom-tool invoke result: the upstream response body plus the upstream HTTP outcome.
/// </summary>
public class CustomToolInvokeResDto : CloudConnectorResDto
{
    /// <summary>True when the upstream API responded with a 2xx status code.</summary>
    public bool Success { get; set; }

    /// <summary>The HTTP status code returned by the upstream API.</summary>
    public int? UpstreamStatusCode { get; set; }
}
