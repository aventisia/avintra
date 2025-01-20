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
        TenantResolverConfig tenantResolverConfig,
        JwtConfig jwtConfig)
    {
        // Get tenantId from jwt or request header
        GetTenantIdFromJwtOrRequestHeader(
            context,
            jwtConfig,
            tenantResolverConfig,
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

        await _next(context);
    }

    private void GetTenantIdFromJwtOrRequestHeader(
        HttpContext context,
        JwtConfig jwtConfig,
        TenantResolverConfig tenantResolverConfig,
        out string tenantId,
        out string userId)
    {
        // Assign out param
        tenantId = "Unknown";
        userId = "Unknown";

        try
        {
            // get current endpoint
            var currentEndpoint = (context.Request.Method + ":" + context.Request.Path).ToLower();

            // Check for tenantless endpoint
            if (tenantResolverConfig.TenantlessEndpoints != null && tenantResolverConfig.TenantlessEndpoints.Contains(currentEndpoint))
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
                var jwtInfo = JwtClaimsDataUtil.GetJwtClaimsData(jwt, jwtConfig);

                // JWTInfo found
                if (jwtInfo != null)
                {
                    tenantId = jwtInfo?.TenantId ?? "Unknown";
                    userId = jwtInfo?.UserId ?? "Unknown";
                    return;
                }
            }

            // Check if endpoint is accepted where tenantId can be in Request Header
            if (tenantResolverConfig.TenantIdInHeaderEndpoints != null && !tenantResolverConfig.TenantIdInHeaderEndpoints.Contains(currentEndpoint))
                return;

            // Get tenantId from custom request header
            context.Request.Headers.TryGetValue("tntid", out var tenantIdFromHeader);

            // tid not found in request header
            if (!string.IsNullOrEmpty(tenantIdFromHeader))
            {
                // Set tenant Id 
                tenantId = tenantIdFromHeader.ToString();
                userId = "Unknown"; // Even we can try to get userId from UserName cookie but its safe to set unknown since user is not autheraized
                return;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        return;
    }
}
