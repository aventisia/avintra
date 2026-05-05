namespace NodeLibrary.Helpers;

public static class AppConfigHelper
{
    public static string ResolveAppBaseUrl()
    {
        var baseUrl = Environment.GetEnvironmentVariable("APP_BASE_URL");

        if (string.IsNullOrWhiteSpace(baseUrl))
            baseUrl = System.Configuration.ConfigurationManager.AppSettings["APP_BASE_URL"];

        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new InvalidOperationException("APP_BASE_URL is not configured. Set it in environment variables or ConfigurationManager AppSettings.");

        return baseUrl;
    }
}