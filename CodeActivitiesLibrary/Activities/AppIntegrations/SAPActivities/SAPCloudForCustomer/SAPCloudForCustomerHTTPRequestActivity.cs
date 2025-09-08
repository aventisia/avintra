using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("SAP Cloud for Customer HTTP Request")]
    [Description("Performs HTTP requests to interact with SAP Cloud for Customer using OAuth 2.0 authentication.")]
    public class SAPCloudForCustomerHTTPRequestActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP C4C App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP C4C App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., 'com.sap.cloud.c4c.api').")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("Subdomain")]
        [Description("Your SAP C4C subdomain (e.g., 'mycompany' in mycompany.crm.ondemand.com).")]
        public InArgument<string> Subdomain { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method (GET, POST, PUT, DELETE).")]
        public InArgument<HttpMethodEnum> HttpMethod { get; set; } = HttpMethodEnum.GET;

        [RequiredArgument]
        [DisplayName("API Endpoint")]
        [Description("The full endpoint path (e.g., /salesorder/v1/salesorders).")]
        public InArgument<string> ApiEndpoint { get; set; }

        [DisplayName("Headers")]
        [Description("Optional headers as JSON object (e.g., {\"X-Custom-Key\": \"value\"}).")]
        public InArgument<string> Headers { get; set; }

        [DisplayName("JSON Payload")]
        [Description("Body for POST/PUT requests (leave empty for GET/DELETE).")]
        public InArgument<string> JsonPayload { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Response")]
        [Description("Raw response body from SAP C4C API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var subdomain = Subdomain.Get(context);
                var httpMethod = HttpMethod.Get(context);
                var apiEndpoint = ApiEndpoint.Get(context);
                var headersJson = Headers.Get(context);
                var jsonPayload = JsonPayload.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("Subdomain is required.");
                if (string.IsNullOrWhiteSpace(apiEndpoint))
                    throw new ArgumentException("API Endpoint is required.");

                // Build full URL
                var baseUrl = $"https://{subdomain}.crm.ondemand.com";
                var apiUrl = $"{baseUrl}{apiEndpoint}";

                // Step 1: Get OAuth Access Token

                var tokenHelper = new GetAccessTokenCloudForCustomersHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                // Step 2: Send HTTP Request
                var (response, statusCode) = SendRequest(token, apiUrl, httpMethod, headersJson, jsonPayload);

                // Set outputs
                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode >= 200 && statusCode < 300);
                StatusMessage.Set(context, statusCode >= 200 && statusCode < 300
                    ? "HTTP request completed successfully."
                    : $"SAP C4C returned status {statusCode}.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error performing SAP C4C HTTP request: {ex.Message}";
                Response.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        // ----------------------
        // Helper: Get OAuth Token
        // ----------------------

      

        // ----------------------
        // Helper: Send Request
        // ----------------------

        private (string response, int statusCode) SendRequest(
            string token,
            string url,
            HttpMethodEnum method,
            string headersJson,
            string jsonPayload)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            // Add custom headers
            if (!string.IsNullOrEmpty(headersJson))
            {
                var headers = JsonConvert.DeserializeObject<Dictionary<string, string>>(headersJson);
                foreach (var header in headers)
                {
                    client.DefaultRequestHeaders.Add(header.Key, header.Value);
                }
            }

            var request = new HttpRequestMessage();

            // Map custom enum to System.Net.Http.HttpMethod
            switch (method)
            {
                case HttpMethodEnum.GET:
                    request.Method = System.Net.Http.HttpMethod.Get;
                    break;
                case HttpMethodEnum.POST:
                    request.Method = System.Net.Http.HttpMethod.Post;
                    break;
                case HttpMethodEnum.PUT:
                    request.Method = System.Net.Http.HttpMethod.Put;
                    break;
                case HttpMethodEnum.DELETE:
                    request.Method = System.Net.Http.HttpMethod.Delete;
                    break;
                default:
                    throw new ArgumentException($"Unsupported HTTP method: {method}");
            }

            // Add content for POST/PUT
            if (method == HttpMethodEnum.POST || method == HttpMethodEnum.PUT)
            {
                if (!string.IsNullOrEmpty(jsonPayload))
                {
                    request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                }
            }

            var response = client.SendAsync(request).Result;
            var responseText = response.Content.ReadAsStringAsync().Result;
            return (responseText, (int)response.StatusCode);
        }
    }

    // Custom Enum for HTTP Methods (avoids confusion)
    public enum HttpMethodEnum
    {
        [Display(Name = "GET", Description = "Retrieves data from the specified resource.")]
        GET,
        [Display(Name = "POST", Description = "Submits data to be processed to the specified resource.")]
        POST,
        [Display(Name = "PUT", Description = "Updates a current resource with new data.")]
        PUT,
        [Display(Name = "DELETE", Description = "Deletes the specified resource.")]
        DELETE,
        [Display(Name = "PATCH", Description = "Applies partial modifications to a resource.")]
        PATCH
    }
}