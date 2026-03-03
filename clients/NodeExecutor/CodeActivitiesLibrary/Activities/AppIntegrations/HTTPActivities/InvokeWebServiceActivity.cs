using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security;
using System.Text;
using System.Threading.Tasks;
namespace CodeActivitiesLibrary.AppIntegrations.HttpActivities
{
    [DisplayName("Invoke Web Service")]
    [Description("Invokes a web service (REST or SOAP) and returns the response text.")]
    [ActivityMetaData(nodeImg:"/assets/HTTP.svg")]
    public class InvokeWebServiceActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The URL of the web service endpoint (e.g., https://api.example.com/data).")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method to use: GET, POST, PUT, DELETE, etc.")]
        [DefaultValue(HttpMethodsEnum.GET)]
        public InArgument<HttpMethodsEnum> HttpMethod { get; set; }

        [DisplayName("Request Body")]
        [Description("The request body to send in POST, PUT, etc. Leave empty for GET requests.")]
        public InArgument<string> RequestBody { get; set; }

        [DisplayName("Content Type")]
        [Description("Specifies the content type for the request body (e.g., application/json, text/xml).")]
        [DefaultValue("application/json")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Accept Header")]
        [Description("Specifies the content type expected in the response (e.g., application/json, text/xml).")]
        [DefaultValue("application/json")]
        public InArgument<string> AcceptHeader { get; set; }

        [DisplayName("Authentication Type")]
        [Description("Type of authentication to use: None, Basic, Bearer, etc.")]
        public InArgument<AuthenticationTypeEnum> AuthenticationType { get; set; }

        [DisplayName("Username")]
        [Description("Username for basic authentication.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
        public InArgument<string> Username { get; set; }

        [DisplayName("Password")]
        [Description("Password for basic authentication.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Bearer Token")]
        [Description("Bearer token for OAuth authentication.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Bearer)]
        public InArgument<string> BearerToken { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the service to respond.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Use Default Credentials")]
        [Description("If true, sends credentials of the current user with the request.")]
        public InArgument<bool> UseDefaultCredentials { get; set; }

        [DisplayName("Ignore SSL Errors")]
        [Description("If true, ignores SSL certificate validation errors.")]
        public InArgument<bool> IgnoreSslErrors { get; set; }

        [DisplayName("Headers")]
        [Description("Custom HTTP headers to include in the request.")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }

        [DisplayName("Result")]
        [Description("Returns the raw response from the web service as a string.")]
        public OutArgument<string> Result { get; set; }

        [DisplayName("Response Code")]
        [Description("Returns the HTTP status code from the web service.")]
        public OutArgument<int> ResponseCode { get; set; }

        [DisplayName("Response Headers")]
        [Description("Returns the response headers from the web service.")]
        public OutArgument<Dictionary<string, string>> ResponseHeaders { get; set; }


        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var url = EndpointUrl.Get(context);
            var method = HttpMethod.Get(context);
            var body = RequestBody.Get(context);
            var contentType = ContentType.Get(context);
            var acceptType = AcceptHeader.Get(context);
            var timeout = TimeoutSeconds.Get(context);
            var useDefaultCreds = UseDefaultCredentials.Get(context);
            var ignoreSsl = IgnoreSslErrors.Get(context);
            var headers = Headers.Get(context);
            var authType = AuthenticationType.Get(context);
            var username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            var bearerToken = BearerToken.Get(context);

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Endpoint URL must be specified.");
            var task = InvokeWebServiceAsync(
                url, method, body, contentType, acceptType,
                timeout, useDefaultCreds, ignoreSsl, headers,
                authType.ToString(), username, password, bearerToken);

            var tcs = new TaskCompletionSource<HttpResponseMessage>(state);
            task.ContinueWith(t =>
            {
                if (t.IsFaulted) tcs.TrySetException(t.Exception.InnerExceptions);
                else if (t.IsCanceled) tcs.TrySetCanceled();
                else tcs.TrySetResult(t.Result);
                callback?.Invoke(tcs.Task);
            });
            return tcs.Task;
        }
        protected override async void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<HttpResponseMessage>)result;
            var responseContent = "";
            var status = "Operation completed successfully.";
            var responseCode = 0;
            var responseHeaders = new Dictionary<string, string>();
            try
            {
                var response = await task;
                responseCode = (int)response.StatusCode;
                foreach (var header in response.Headers) responseHeaders[header.Key] = string.Join(",", header.Value);
                if (response.Content != null)
                {
                    foreach (var header in response.Content.Headers)
                        responseHeaders[header.Key] = string.Join(",", header.Value);
                    responseContent = await response.Content.ReadAsStringAsync();
                }
                status = response.IsSuccessStatusCode
                    ? $"Successfully invoked {response.RequestMessage.Method} on {response.RequestMessage.RequestUri}"
                    : $"Web service returned error: {response.ReasonPhrase} ({responseCode})";
                Result.Set(context, responseContent);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                ResponseCode.Set(context, responseCode);
                ResponseHeaders.Set(context, responseHeaders);
            }
            catch (AggregateException ae)
            {
                var ex = ae.InnerException;
                responseContent = "";
                status = $"Error invoking web service: {ex.Message}";
                responseCode = -1;
                if (ex is HttpRequestException httpEx && httpEx.InnerException is WebException webEx)
                    if (webEx.Response is HttpWebResponse errorResponse)
                    {
                        responseCode = (int)errorResponse.StatusCode;
                        status = $"HTTP Error: {errorResponse.StatusDescription} ({responseCode})";
                    }
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
        private static async Task<HttpResponseMessage> InvokeWebServiceAsync(
            string url, HttpMethodsEnum method, string body, string contentType, string acceptType,
            int timeoutSeconds, bool useDefaultCreds, bool ignoreSsl, Dictionary<string, string> headers,
            string authType, string username, string password, string bearerToken)
        {
            var handler = new HttpClientHandler();
            if (useDefaultCreds)
                handler.UseDefaultCredentials = true;
            if (ignoreSsl)
                handler.ServerCertificateCustomValidationCallback =
                    (message, cert, chain, errors) => true;
            using (var client = new HttpClient(handler))
            {
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));
                // Set authentication
                if (!string.IsNullOrWhiteSpace(authType))
                    switch (authType.ToLower())
                    {
                        case "basic":
                            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                            {
                                var byteArray = Encoding.ASCII.GetBytes($"{username}:{password}");
                                handler.PreAuthenticate = true;
                                handler.Credentials = new NetworkCredential(username, password);
                            }
                            break;
                        case "bearer":
                            if (!string.IsNullOrWhiteSpace(bearerToken))
                                client.DefaultRequestHeaders.Authorization =
                                    new AuthenticationHeaderValue("Bearer", bearerToken);
                            break;
                    }
                // Add custom headers
                if (headers != null)
                    foreach (var header in headers)
                        client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                HttpResponseMessage response;
                switch (method)
                {
                    case HttpMethodsEnum.GET:
                        response = await client.GetAsync(url);
                        break;
                    case HttpMethodsEnum.POST:
                        var postContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PostAsync(url, postContent);
                        break;
                    case HttpMethodsEnum.PUT:
                        var putContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PutAsync(url, putContent);
                        break;
                    case HttpMethodsEnum.DELETE:
                        response = await client.DeleteAsync(url);
                        break;
                    case HttpMethodsEnum.PATCH:
                        var patchContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.SendAsync(new HttpRequestMessage(new HttpMethod("PATCH"), url)
                            { Content = patchContent });
                        break;
                    default:
                        throw new ArgumentException($"Unsupported HTTP method: '{method}'");
                }
                return response;
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
        public enum AuthenticationTypeEnum
        {
            [Display(Name = "Basic", Description = "Uses Basic authentication with username and password.")]
            Basic,
            [Display(Name = "Bearer", Description = "Uses Bearer token authentication for OAuth 2.0.")]
            Bearer
        }
    }
}