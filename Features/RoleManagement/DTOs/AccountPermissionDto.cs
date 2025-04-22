namespace AccountsAPIs.DTOs;

/// <summary>
/// Defines the configuration of a specific permission assigned to a role within the system.
/// Each permission includes a type (such as Projects or Clients) and associated access levels (like Read or FullAccess).
/// </summary>
public class AccountPermissionDto
{
    /// <summary>
    /// Indicates the category of permission assigned to the role. 
    /// This defines what functional area the role has access to (e.g., Projects, Clients, BillingManager).
    /// </summary>
    public PermissionTypesEnum PermissionType { get; set; }

    /// <summary>
    /// A list of access levels granted for the specified permission type.
    /// This may include one or more values such as Read, Write, or FullAccess.
    /// </summary>
    public List<PermissionAccessTypesEnum> Accesses { get; set; } = new();
}
