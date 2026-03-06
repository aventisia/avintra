using Microsoft.AspNetCore.Mvc.Filters;

namespace AspNetToolkit.Attributes;

// Custom attribute used for API key authorization on classes or methods.
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class CustomAuthorizeAttribute : Attribute, IAuthorizationFilter
{
    // Header name to retrieve the API key from the request
    private const string API_KEY_HEADER_NAME = "X-API-KEY";

    // Executes the authorization logic to verify the API key in the request header.
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Get the APIKeyConfig service from the request's service provider
        var apiKeyConfig = context.HttpContext.RequestServices.GetRequiredService<EnvironmentConfig>();

        // Set the expected API key from the configuration
        var expectedApiKey = apiKeyConfig.CustomApiKey;

        // Try to get the actual API key from the request header
        if (!context.HttpContext.Request.Headers.TryGetValue(API_KEY_HEADER_NAME, out var actualApiKey))
        {
            // If the API key is missing in the header, return a 401 Unauthorized response
            context.Result = new ContentResult()
            {
                StatusCode = 401,
                Content = "API Key is missing."
            };
            return;
        }

        // Compare the provided API key with the expected API key
        if (!string.Equals(expectedApiKey, actualApiKey))
        {
            // If the API key is invalid, return a 403 Forbidden response
            context.Result = new ContentResult()
            {
                StatusCode = 403,
                Content = "Invalid API Key."
            };
        }
    }
}