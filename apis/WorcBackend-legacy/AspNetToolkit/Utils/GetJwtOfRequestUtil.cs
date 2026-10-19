namespace AspNetToolkit.Utils;

public static class GetJwtOfRequestUtil
{
    public static string? GetJwtOfRequest(HttpContext? context)
    {
        string? jwt = "jwt-not-found";
        try
        {
            if (context == null)
                return jwt;

            // Try to get JWT from cookie
            jwt = context.Request.Cookies[CookieNamesEnum.AccessToken.ToString()];

            // JWT not found in cookie. Try Authorization header
            if (string.IsNullOrEmpty(jwt))
            {
                string? bearerJwt = context.Request.Headers[HeaderNames.Authorization];
                if (!string.IsNullOrWhiteSpace(bearerJwt))
                {
                    const string bearerPrefix = "Bearer ";
                    jwt = bearerJwt.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase)
                        ? bearerJwt[bearerPrefix.Length..].Trim()
                        : bearerJwt.Trim();
                }
            } 
        }
        catch
        {
            return jwt;
        }
        return jwt;
    }
}