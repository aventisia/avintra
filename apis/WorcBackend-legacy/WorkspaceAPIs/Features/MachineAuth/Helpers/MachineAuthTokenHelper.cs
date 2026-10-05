using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace WorkspaceAPIs.Helpers;

public static class MachineAuthTokenHelper
{
    /// <summary>
    /// Creates a JWT for a machine's linked user account using the shared signing secret.
    /// The token carries only the core identity claims (tenant, user, username) so it is
    /// accepted by the existing JwtBearer authentication and TenantResolver without
    /// requiring a session (no "sid" claim is included).
    /// </summary>
    /// <param name="environmentConfig">Environment configuration holding the JWT secret, issuer and validity.</param>
    /// <param name="tenantId">The tenant ID claim value.</param>
    /// <param name="userId">The linked workspace user ID claim value.</param>
    /// <param name="userName">The linked workspace user's username claim value.</param>
    /// <param name="machineId">The ID of the machine this token authenticates, emitted as the "mid" claim.</param>
    /// <returns>The signed JWT string.</returns>
    public static (string Jwt, DateTimeOffset ExpiresOn) CreateMachineJwt(
        EnvironmentConfig environmentConfig,
        Guid tenantId,
        Guid userId,
        string userName,
        Guid machineId)
    {
        // Compute the expiry upfront so it can be returned alongside the token
        var expiresOn = DateTimeOffset.UtcNow.AddMinutes(environmentConfig.JwtValidityInMinutes);

        // Base claims (mirror AccountsAPIs CreateJwt core claims)
        var claims = new Dictionary<string, object>
        {
            ["tntid"] = tenantId.ToString(),
            ["uid"] = userId.ToString(),
            ["uname"] = userName,
            [MachineIdentityClaims.MachineIdClaimType] = machineId.ToString(),
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
        };

        // Signing credentials using the shared JWT secret
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(environmentConfig.JwtSecretKey)),
            SecurityAlgorithms.HmacSha512);

        // Token descriptor matching the issuer/audience used by AddJwtBearer
        var securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = $"https://{environmentConfig.AppBaseUrl}",
            Audience = $"https://{environmentConfig.AppBaseUrl}",
            Claims = claims,
            IssuedAt = DateTime.UtcNow,
            Expires = expiresOn.UtcDateTime,
            SigningCredentials = signingCredentials
        };

        var jsonWebTokenHandler = new Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler();
        jsonWebTokenHandler.SetDefaultTimesOnTokenCreation = false;

        // Return the signed JWT and its expiry
        return (jsonWebTokenHandler.CreateToken(securityTokenDescriptor), expiresOn);
    }
}
