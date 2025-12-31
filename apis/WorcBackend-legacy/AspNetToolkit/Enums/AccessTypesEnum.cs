namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing different access levels for sharing a flow block.
/// </summary>
public enum AccessTypesEnum
{
    /// <summary>
    /// Access restricted to a specific agent.
    /// </summary>
    AgentLevel,

    /// <summary>
    /// Access restricted to users within a specific tenant.
    /// </summary>
    TenantLevel,

    /// <summary>
    /// Access open to all users, including the public.
    /// </summary>
    Public,

    /// <summary>
    /// Access restricted to users within a specific space.
    /// </summary>
    Space
}
