namespace AspNetToolkit.Utils;

public static class RequestCloudConnectorUtil
{

    /// <summary>
    /// Adds GitHub Authorization and User-Agent headers to the given HttpClient.
    /// </summary>
    /// <param name="httpClient">The HttpClient instance to configure.</param>
    /// <param name="personalAccessToken">GitHub Personal Access Token (PAT).</param>
        public static HttpClient CreateGitHubHttpClient(string personalAccessToken)
        {
            if (string.IsNullOrWhiteSpace(personalAccessToken))
                throw new ArgumentException("GitHub Personal Access Token must not be null or empty.", nameof(personalAccessToken));

            var httpClient = new HttpClient();

            // Required GitHub headers
            httpClient.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("AspNetToolkit", "1.0"));
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", personalAccessToken);

            return httpClient;
        }
}