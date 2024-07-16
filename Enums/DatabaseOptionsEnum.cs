

namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the options for the database configuration in a multi-tenant application.
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum DatabaseOptionsEnum
{
    /// <summary>
    /// Tenants share a common database infrastructure. Suitable for low-resource tenants or those not requiring high isolation.
    /// </summary>
    Shared,

    /// <summary>
    /// Tenants have their own database schema within a shared infrastructure. Offers a balance between cost and isolation.
    /// </summary>
    Isolated,

    /// <summary>
    /// Tenants have their own dedicated database server. Provides the highest performance and complete isolation, but comes at a higher cost.
    /// </summary>
    DedicatedServer,
}