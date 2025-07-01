namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the different sharing levels for a flow block.
/// </summary>
public enum BlockSharingTypesEnum
{
    /// <summary>
    /// Represents a sharing level restricted to an agent.
    /// </summary>
    AgentLevel,

    /// <summary>
    /// Represents a sharing level restricted to a tenant.
    /// </summary>
    TenantLevel,

    /// <summary>
    /// Represents a sharing level that is publicly accessible.
    /// </summary>
    Public
}
