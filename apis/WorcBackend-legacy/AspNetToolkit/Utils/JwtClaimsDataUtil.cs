namespace AspNetToolkit.Utils;

public static class JwtClaimsDataUtil
{
    /// <summary>
    /// Extracts Jwt claims data from Jwt after validating it
    /// </summary>
    /// <param name="jwt"></param>
    /// <param name="jwtIssuer"></param>
    /// <param name="jwtAudience"></param>
    /// <param name="jwtSecretKey"></param>
    /// <returns>JwtClaimsData object containing all extracted claims of jwt</returns>
    public static JwtClaimsData? GetJwtClaimsData(
        string jwt, 
        string jwtIssuer, 
        string jwtAudience,
        string jwtSecretKey)
    {
        SecurityToken validatedToken;

        var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            ClockSkew = TimeSpan.Zero
        };

        if (jwtSecurityTokenHandler.CanReadToken(jwt))
        {
            ClaimsPrincipal claimsPrincipal;
            try
            {
                // This line throws if invalid
                claimsPrincipal = jwtSecurityTokenHandler.ValidateToken(
                    jwt,
                    tokenValidationParameters,
                    out validatedToken);

                // If we got here then the token is valid.
                if (claimsPrincipal.Claims.Count() > 0)
                {
                    var claims = claimsPrincipal.Claims;

                    /*In case of Jwt/AccessToken for pwd reset, sid and ClaimTypes.Role will be missing*/
                    return new JwtClaimsData()
                    {
                        SessionId = claims.Where(c => c.Type == "sid").FirstOrDefault()?.Value,
                        TenantId = claims.Where(c => c.Type == "tntid").FirstOrDefault()?.Value,
                        JwtId = claims.Where(c => c.Type == "jti").FirstOrDefault()?.Value,
                        IssuedAt = claims.Where(c => c.Type == "iat").FirstOrDefault()?.Value,
                        UserId = claims.Where(c => c.Type == "uid").FirstOrDefault()?.Value,
                        UserName = claims.Where(c => c.Type == "uname").FirstOrDefault()?.Value,
                        UserRoles = claims.Where(c => c.Type == ClaimTypes.Role).Select(s => s.Value).ToList(),
                        ValidTo = validatedToken.ValidTo
                    };
                }
            }
            catch
            {
            }
        }
        return null;
    }
}