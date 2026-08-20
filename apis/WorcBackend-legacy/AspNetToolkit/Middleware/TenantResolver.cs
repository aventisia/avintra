/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace AspNetToolkit.Middleware;

public class TenantResolver
{
    private readonly RequestDelegate _next;
    public TenantResolver(RequestDelegate next)
    {
        _next = next;
    }

    // Get Tenant Id from incoming requests 
    public async Task InvokeAsync(
        HttpContext context,
        ICurrentTenantService currentTenantService,
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig)
    {
        // Get tenantId from jwt or request header
        GetTenantIdFromJwtOrRequestHeader(
            context,
            environmentConfig,
            appDefaultConfig,
            out string tenantId,
            out string userId);

        // Unkown tenant
        if (tenantId.Equals("Unknown"))
            throw new Exception("Invalid Tenant");

        // Set Tenant
        var setTenantResult = await currentTenantService.SetTenantAndUser(tenantId, userId);

        // Invalid tenant
        if (!setTenantResult.Equals("pass"))
            throw new Exception(setTenantResult);

        // Resolve the current space for this request.
        // Prefer the "X-Space-Id" request header; fall back to the "spid" JWT claim.
        // Guid.Empty (absent) means the default "Central" space.
        currentTenantService.CurrentSpaceId = ResolveSpaceId(context);

        // Resolve the deployment environment for this request from the "X-Env-Type" header,
        // defaulting to Dev when absent or unrecognized.
        currentTenantService.CurrentEnvType = ResolveEnvType(context);

        await _next(context);
    }

    // Resolves the current environment from the "X-Env-Type" request header.
    // Returns Dev when the header is missing or holds an unsupported value.
    private static ConfigureEnvironmentType ResolveEnvType(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Env-Type", out var envTypeHeader) &&
            Enum.TryParse<ConfigureEnvironmentType>(envTypeHeader.ToString(), ignoreCase: true, out var envType))
        {
            return envType;
        }

        // No environment selected -> Dev.
        return ConfigureEnvironmentType.Dev;
    }

    // Resolves the current space ID from the "X-Space-Id" header, falling back to the "spid" JWT claim.
    private static Guid ResolveSpaceId(HttpContext context)
    {
        // Prefer the "X-Space-Id" request header.
        if (context.Request.Headers.TryGetValue("X-Space-Id", out var spaceIdHeader) &&
            Guid.TryParse(spaceIdHeader.ToString(), out var headerSpaceId))
        {
            return headerSpaceId;
        }

        // Fall back to the "spid" JWT claim (used by the templates feature).
        if (Guid.TryParse(context.User?.FindFirstValue("spid"), out var claimSpaceId))
        {
            return claimSpaceId;
        }

        // No space selected -> Central.
        return Guid.Empty;
    }

    private void GetTenantIdFromJwtOrRequestHeader(
        HttpContext context,
        EnvironmentConfig environmentConfig,
        AppDefaultConfig appDefaultConfig,
        out string tenantId,
        out string userId)
    {
        // Assign out param
        tenantId = "Unknown";
        userId = "Unknown";

        try
        {
            var path = context.Request.Path.ToString().ToLower();

            // remove GUID
            path = Regex.Replace(path, @"/[0-9a-fA-F-]{36}", "");

            // get current endpoint
            var currentEndpoint = (context.Request.Method + ":" + path).ToLower();

            // Check for tenantless endpoint
            if (appDefaultConfig.TenantlessEndpoints != null && appDefaultConfig.TenantlessEndpoints.Any(pattern =>
                {
                    var regexPattern = "^" + System.Text.RegularExpressions.Regex.Escape(pattern).Replace("\\*", ".*") + "$";
                    return System.Text.RegularExpressions.Regex.IsMatch(currentEndpoint, regexPattern);
                }))
            {
                tenantId = "TenantlessEndpoint";
                return;
            }

            // Try to get JWT
            string jwt = GetJwtOfRequestUtil.GetJwtOfRequest(context) ?? string.Empty;

            // JWT found
            if (!string.IsNullOrEmpty(jwt))
            {
                // Extract info from JWT
                var jwtInfo = JwtClaimsDataUtil.GetJwtClaimsData(
                    jwt,
                    $"https://{environmentConfig.AppBaseUrl}",
                    $"https://{environmentConfig.AppBaseUrl}",
                    $"{environmentConfig.JwtSecretKey}");

                // Get user roles from the JWT, defaulting to an empty list if not present
                var currentUserRoles = jwtInfo?.UserRoles ?? new List<string>();

                // Check if tenant ID should be taken from the request header for a specific endpoint
                if (currentUserRoles.Contains("SA") &&
                    appDefaultConfig.TenantIdInHeaderEndpoints != null &&
                    appDefaultConfig.TenantIdInHeaderEndpoints.Contains(currentEndpoint))
                {
                    // Try to get the tenant ID from the request header "X-TENANT-ID"
                    if (TryGetTenantIdFromHeaders(context.Request.Headers, out var tenantIdRequestFromHeader))
                    {
                        tenantId = tenantIdRequestFromHeader ?? "Unknown"; // Set tenant ID from header
                        userId = jwtInfo?.UserId ?? "Unknown"; // Extract user ID from JWT
                        return; // Exit after successfully setting tenant and user
                    }
                }

                // JWTInfo found
                if (jwtInfo != null)
                {
                    tenantId = jwtInfo?.TenantId ?? "Unknown";
                    userId = jwtInfo?.UserId ?? "Unknown";
                    return;
                }
            }

            // Check if endpoint is accepted where tenantId can be in Request Header
            if (appDefaultConfig.TenantIdInHeaderEndpoints != null && !appDefaultConfig.TenantIdInHeaderEndpoints.Contains(currentEndpoint))
                return;

            // Get tenantId from custom request header
            if (TryGetTenantIdFromHeaders(context.Request.Headers, out var tenantIdFromHeader))
            {
                // Set tenant Id 
                tenantId = tenantIdFromHeader ?? "Unknown"; // Even we can try to get userId from UserName cookie but its safe to set unknown since user is not autheraized
                userId = "Unknown";
                return;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        return;
    }

    // Tries to read the tenant id from the "X-TENANT-ID" request header.
    private static bool TryGetTenantIdFromHeaders(IHeaderDictionary headers, out string? tenantId)
    {
        tenantId = null;

        // Prefer the standard "X-TENANT-ID" header.
        if (headers.TryGetValue("X-TENANT-ID", out var tenantIdFromHeader) && !string.IsNullOrEmpty(tenantIdFromHeader))
        {
            tenantId = tenantIdFromHeader.ToString();
            return true;
        }

        return false;
    }
}
