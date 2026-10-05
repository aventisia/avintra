namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Reads the machine identity claims carried by a machine JWT: the machine id ("mid"),
/// the linked user id ("uid") and the tenant id ("tntid").
/// </summary>
public static class MachineIdentityClaims
{
    /// <summary>
    /// The claim type carrying the machine id of the authenticated machine token.
    /// </summary>
    public const string MachineIdClaimType = "mid";

    /// <summary>
    /// Attempts to read the machine id ("mid") claim. Returns false for tokens minted before
    /// the claim existed or for non-machine callers (for example API-key callers).
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

    /// <summary>
    /// Returns true when the principal belongs to an authenticated caller.
    /// </summary>
    public static bool IsAuthenticated(ClaimsPrincipal? user)
        => user?.Identity?.IsAuthenticated == true;

    // Parses a Guid claim, returning false when the claim is missing or not a non-empty Guid.
    private static bool TryGetGuid(ClaimsPrincipal? user, string claimType, out Guid value)
    {
        value = Guid.Empty;

        var rawValue = user?.FindFirstValue(claimType);
        return Guid.TryParse(rawValue, out value) && value != Guid.Empty;
    }
}
