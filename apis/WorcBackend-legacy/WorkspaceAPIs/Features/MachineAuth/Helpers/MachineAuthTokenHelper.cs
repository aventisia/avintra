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
    /// <param name="machineId">The optional machine ID this token authenticates.</param>
    /// <returns>The signed JWT string.</returns>
    public static (string Jwt, DateTimeOffset ExpiresOn) CreateMachineJwt(
        EnvironmentConfig environmentConfig,
        Guid tenantId,
        Guid userId,
        string userName,
        Guid? machineId)
    {
        var expiresOn = DateTimeOffset.UtcNow.AddMinutes(environmentConfig.JwtValidityInMinutes);

        var claims = new Dictionary<string, object>
        {
            ["tntid"] = tenantId.ToString(),
            ["uid"] = userId.ToString(),
            ["uname"] = userName,
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
        };

        if (machineId.HasValue)
            claims[MachineIdentityClaims.MachineIdClaimType] = machineId.Value.ToString();

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(environmentConfig.JwtSecretKey)),
            SecurityAlgorithms.HmacSha512);

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

        return (jsonWebTokenHandler.CreateToken(securityTokenDescriptor), expiresOn);
    }
}
