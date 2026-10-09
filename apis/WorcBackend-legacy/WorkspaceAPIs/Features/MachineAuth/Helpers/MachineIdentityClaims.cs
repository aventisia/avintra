namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Reads the machine identity claims carried by a machine JWT.
/// </summary>
public static class MachineIdentityClaims
{
    /// <summary>
    /// The claim type carrying the machine id of the authenticated machine token.
    /// </summary>
    public const string MachineIdClaimType = "mid";

    /// <summary>
    /// Attempts to read the machine id ("mid") claim, returning false for tokens without it or non-machine callers.
    /// </summary>
    public static bool TryGetMachineId(ClaimsPrincipal? user, out Guid machineId)
        => TryGetGuid(user, MachineIdClaimType, out machineId);

    /// <summary>
    /// Attempts to read the linked workspace user id ("uid") claim.
    /// </summary>
    public static bool TryGetUserId(ClaimsPrincipal? user, out Guid userId)
        => TryGetGuid(user, "uid", out userId);

    /// <summary>
    /// Attempts to read the tenant id ("tntid") claim.
    /// </summary>
    public static bool TryGetTenantId(ClaimsPrincipal? user, out Guid tenantId)
        => TryGetGuid(user, "tntid", out tenantId);

    private static bool TryGetGuid(ClaimsPrincipal? user, string claimType, out Guid value)
    {
        value = Guid.Empty;

        var rawValue = user?.FindFirstValue(claimType);
        return Guid.TryParse(rawValue, out value) && value != Guid.Empty;
    }
}
