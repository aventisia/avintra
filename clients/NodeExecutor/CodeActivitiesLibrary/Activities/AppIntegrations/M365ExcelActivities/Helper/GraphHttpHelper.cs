using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Azure.Identity;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers
{
    public static class GraphHttpHelper
    {
        /// <summary>
        /// Gets a HttpClient with Microsoft Graph Bearer token.
        /// </summary>
        public static async Task<HttpClient> GetAuthenticatedClient(string tenantId, string clientId, string clientSecret)
        {
            var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            var token = await credential.GetTokenAsync(new Azure.Core.TokenRequestContext(new[] { "https://graph.microsoft.com/.default" }));

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.Token);

            return client;
        }

        /// <summary>
        /// Sends a GET request to Microsoft Graph.
        /// </summary>
        public static async Task<HttpResponseMessage> GetAsync(HttpClient client, string url)
        {
            return await client.GetAsync(url);
        }

        /// <summary>
        /// Sends a POST request with JSON payload.
        /// </summary>
        public static async Task<HttpResponseMessage> PostAsync(HttpClient client, string url, object payload)
        {
            var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            return await client.PostAsync(url, content);
        }

        /// <summary>
        /// Sends a PATCH request with JSON payload.
        /// </summary>
        public static async Task<HttpResponseMessage> PatchAsync(HttpClient client, string url, object payload)
        {
            var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var request = new HttpRequestMessage(new HttpMethod("PATCH"), url) { Content = content };
            return await client.SendAsync(request);
        }

        /// <summary>
        /// Sends a PUT request with raw byte content (e.g., empty Excel file).
        /// </summary>
        public static async Task<HttpResponseMessage> PutAsync(HttpClient client, string url, byte[] contentBytes)
        {
            var content = new ByteArrayContent(contentBytes);
            return await client.PutAsync(url, content);
        }

        /// <summary>
        /// Sends a DELETE request.
        /// </summary>
        public static async Task<HttpResponseMessage> DeleteAsync(HttpClient client, string url)
        {
            return await client.DeleteAsync(url);
        }

        /// <summary>
        /// Helper to build Drive + FilePath URL
        /// </summary>
        public static string BuildDriveItemUrl(string driveId, string filePath, string extra = null)
        {
            var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:{filePath}";
            if (!string.IsNullOrEmpty(extra))
                url += $":{extra}";
            return url;
        }
    }
}
