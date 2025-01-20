namespace AspNetToolkit.Utils;

public static class GetJwtOfRequestUtil
{
    public static string? GetJwtOfRequest(HttpContext? context)
    {
        string jwt = "jwt-not-found";
        try
        {
            if (context == null)
                return jwt;

            // Try to get JWT from cookie
            jwt = context.Request.Cookies[CookieNamesEnum.AccessToken.ToString()] ?? jwt;

            // JWT not found in cookie. Try Authorization header
            if (string.IsNullOrEmpty(jwt))
            {
                string? bearerJwt = context.Request.Headers[HeaderNames.Authorization];
                jwt = !string.IsNullOrEmpty(bearerJwt) ? bearerJwt.Substring(7, bearerJwt.Length - 7) : jwt;
            }
        }
        catch
        {
            return jwt;
        }
        return jwt;
    }
}