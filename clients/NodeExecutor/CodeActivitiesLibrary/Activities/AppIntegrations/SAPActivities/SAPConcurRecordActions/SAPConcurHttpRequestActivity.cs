using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
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
    [DisplayName("SAP Concur HTTP Request")]
    [Description("Perform custom HTTP requests to SAP Concur using existing connector and connection.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class SAPConcurHttpRequestActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP Concur App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP Concur App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., quickexpense.write).")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method (GET, POST, PUT, DELETE).")]
        [DefaultValue(HttpMethodsEnum.GET)]
        public InArgument<HttpMethodsEnum> HttpMethod { get; set; }

        [RequiredArgument]
        [DisplayName("API Endpoint")]
        [Description("The full endpoint path (e.g., /quickexpense/v4/quickexpenses).")]
        public InArgument<string> ApiEndpoint { get; set; }

        [DisplayName("Headers")]
        [Description("Optional headers as JSON object (e.g., {\"X-Custom-Key\": \"value\"}).")]
        public InArgument<string> Headers { get; set; }

        [DisplayName("JSON Payload")]
        [Description("Body for POST/PUT requests (leave empty for GET/DELETE).")]
        public InArgument<string> JsonPayload { get; set; }

        [DisplayName("File Bytes")]
        [Description("Optional file bytes for multipart upload (e.g., receipt).")]
        public InArgument<byte[]> FileBytes { get; set; }

        [DisplayName("File Name")]
        [Description("Name of the file (e.g., receipt.jpg). Required if File Bytes is provided.")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Content Type")]
        [Description("MIME type of file (e.g., image/jpeg). Default: image/jpeg.")]
        [DefaultValue("image/jpeg")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnError { get; set; }

        [DisplayName("Response")]
        [Description("Raw response body from SAP Concur.")]
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
                var httpMethod = HttpMethod.Get(context);
                var apiEndpoint = ApiEndpoint.Get(context);
                var headersJson = Headers.Get(context);
                var jsonPayload = JsonPayload.Get(context);
                var fileBytes = FileBytes.Get(context);
                var fileName = FileName.Get(context);
                var contentType = ContentType.Get(context) ?? "image/jpeg";
                var continueOnError = ContinueOnError.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (string.IsNullOrWhiteSpace(apiEndpoint))
                    throw new ArgumentException("API Endpoint is required.");
               
                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                var apiUrl = $"https://us.api.concursolutions.com{apiEndpoint}";

                var (response, statusCode) = SendRequest(
                    token,
                    apiUrl,
                    httpMethod,
                    headersJson,
                    jsonPayload,
                    fileBytes,
                    fileName,
                    contentType);

                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode >= 200 && statusCode < 300);
                StatusMessage.Set(context, statusCode >= 200 && statusCode < 300
                    ? "HTTP request completed successfully."
                    : $"SAP Concur returned status {statusCode}.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error performing SAP Concur HTTP request: {ex.Message}";
                Response.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private (string response, int statusCode) SendRequest(
            string token,
            string url,
            HttpMethodsEnum method,
            string headersJson,
            string jsonPayload,
            byte[] fileBytes,
            string fileName,
            string contentType)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                client.DefaultRequestHeaders.Add("Accept", "application/json");

                if (!string.IsNullOrEmpty(headersJson))
                {
                    var headers = JsonConvert.DeserializeObject<Dictionary<string, string>>(headersJson);
                    foreach (var header in headers)
                    {
                        client.DefaultRequestHeaders.Add(header.Key, header.Value);
                    }
                }

                var request = new HttpRequestMessage();

                switch (method)
                {
                    case HttpMethodsEnum.GET:
                        request.Method = System.Net.Http.HttpMethod.Get;
                        break;
                    case HttpMethodsEnum.POST:
                        request.Method = System.Net.Http.HttpMethod.Post;
                        // ...
                        break;
                    case HttpMethodsEnum.PUT:
                        request.Method = System.Net.Http.HttpMethod.Put;
                        // ...
                        break;
                    case HttpMethodsEnum.DELETE:
                        request.Method = System.Net.Http.HttpMethod.Delete;
                        break;
                    case HttpMethodsEnum.PATCH:
                        request.Method = new System.Net.Http.HttpMethod("PATCH");
                        // ...
                        break;
                    default:
                        throw new ArgumentException($"Unsupported HTTP method: {method}");
                }


                request.RequestUri = new Uri(url);

                var response = client.SendAsync(request).Result;
                var responseText = response.Content.ReadAsStringAsync().Result;
                return (responseText, (int)response.StatusCode);
            }
        }
    }

    public enum HttpMethodsEnum
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
