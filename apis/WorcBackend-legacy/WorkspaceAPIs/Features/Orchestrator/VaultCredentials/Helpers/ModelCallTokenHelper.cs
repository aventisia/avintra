using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace WorkspaceAPIs.Helpers;

public static class ModelCallTokenHelper
{
    public const string HeaderName = "X-Model-Call-Token";

    /// <summary>
    /// Returns true when the token is a live, signed model-call token that the pipeline minted for exactly this credential name.
    /// </summary>
    public static async Task<bool> IsValidAsync(string? token, EnvironmentConfig environmentConfig, string credentialName)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(environmentConfig.JwtSecretKey))
            return false;

        try
        {
            var result = await new JsonWebTokenHandler().ValidateTokenAsync(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = $"https://{environmentConfig.AppBaseUrl}",
                ValidateAudience = true,
                ValidAudience = $"https://{environmentConfig.AppBaseUrl}/model-credential",
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(environmentConfig.JwtSecretKey)),
                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha512 },
                ValidateLifetime = true,
                RequireExpirationTime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            });

            return result.IsValid &&
                result.Claims.TryGetValue("cred", out var credential) &&
                string.Equals(credential as string, credentialName, StringComparison.Ordinal);
        }
        catch
        {
            return false;
        }
    }
}
