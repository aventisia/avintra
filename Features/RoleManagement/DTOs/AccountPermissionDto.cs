namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a single permission configuration for a specific role.
/// </summary>
public class AccountPermissionDto
{
    /// <summary>
    /// Specifies the type of permission, such as Client, TradePartner, Trade, or Admin.
    /// </summary>
    public PermissionTypesEnum PermissionType { get; set; }

    /// <summary>
    /// Contains all applicable access levels for this permission.
    /// </summary>
    public List<PermissionAccessTypesEnum> Accesses { get; set; } = new();
}