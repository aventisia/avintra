namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Request to invoke a Corsair plugin operation from a workflow node.
/// The credential is resolved by name through the Vault (AppSecret) service,
/// which enforces tenant/space/environment and resource-share authorization.
/// </summary>
public class CorsairInvokeReqDto
{
    /// <summary>The agent invoking the connector.</summary>
    public required string AgentId { get; set; }

    /// <summary>The name of the agent invoking the connector.</summary>
    public required string AgentName { get; set; }

    /// <summary>Corsair plugin identifier, e.g. "github" or "outlook".</summary>
    public required string Plugin { get; set; }

    /// <summary>
    /// PascalCase action segment used in the node name (e.g. "IssuesListConnector").
    /// The exact dotted sidecar operation is resolved from the generated
    /// <c>CorsairActionMap.json</c> file.
    /// </summary>
    public required string Action { get; set; }

    /// <summary>Vault credential name (resolved by name).</summary>
    public required string CredentialName { get; set; }

    /// <summary>The operation payload.</summary>
    public Dictionary<string, object> Payload { get; set; } = new();
}

/// <summary>
/// Result of invoking a Corsair plugin operation.
/// </summary>
public class CorsairInvokeResDto
{
    public bool Success { get; set; }
    public object? Data { get; set; }
    public string? Error { get; set; }
    public string? Details { get; set; }
    public bool NeedsConnect { get; set; }
    public string? Plugin { get; set; }
    public string? AuthType { get; set; }
    public bool ApprovalRequired { get; set; }
    public string? Message { get; set; }

    /// <summary>Normalized error category: auth_failed, rate_limited, provider_outage, provider_error, network_error, invalid_input.</summary>
    public string? ErrorType { get; set; }

    /// <summary>True when the caller may safely retry the operation.</summary>
    public bool Retryable { get; set; }

    /// <summary>Provider-suggested retry delay in milliseconds (rate_limited only).</summary>
    public long? RetryAfterMs { get; set; }
}
