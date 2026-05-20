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
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.HttpActivities
{
    [DisplayName("HTTP Request")]
    [Description("Sends an HTTP request to a RESTful web service and returns the response body, status code, and headers.")]
    [ActivityMetaData(nodeImg: "/assets/HTTP.svg")]
    public class InvokeWebServiceActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The full URL of the web service endpoint. Must include the scheme (e.g., 'https://api.example.com/v1/users').")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP verb for the request. Defaults to GET.")]
        [DefaultValue(HttpMethodsEnum.GET)]
        public InArgument<HttpMethodsEnum> HttpMethod { get; set; }

        [DisplayName("Request Body")]
        [Description("The body payload for POST, PUT, or PATCH requests. Ignored for GET and DELETE. Example: '{\"name\":\"John\",\"age\":30}'.")]
        public InArgument<string> RequestBody { get; set; }

        [DisplayName("Content Type")]
        [Description("The MIME type of the request body. Defaults to 'application/json'. Common values: 'application/json', 'text/xml', 'application/x-www-form-urlencoded'.")]
        [DefaultValue("application/json")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Accept Header")]
        [Description("The MIME type expected in the response. Defaults to 'application/json'. Common values: 'application/json', 'text/xml', 'text/plain'.")]
        [DefaultValue("application/json")]
        public InArgument<string> AcceptHeader { get; set; }

        [DisplayName("Authentication Type")]
        [Description("The authentication scheme to use. Set to 'None' for unauthenticated requests. Defaults to None.")]
        [DefaultValue(AuthenticationTypeEnum.None)]
        public InArgument<AuthenticationTypeEnum> AuthenticationType { get; set; }

        [DisplayName("Username")]
        [Description("The username for HTTP Basic authentication. Required when Authentication Type is 'Basic'.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
        public InArgument<string> Username { get; set; }

        [DisplayName("Password")]
        [Description("The password for HTTP Basic authentication. Required when Authentication Type is 'Basic'.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Bearer Token")]
        [Description("The OAuth 2.0 bearer token (without the 'Bearer ' prefix). Required when Authentication Type is 'Bearer'.")]
        [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Bearer)]
        public InArgument<string> BearerToken { get; set; }

        [DisplayName("Timeout (Seconds)")]
        [Description("Maximum time in seconds to wait for the server to respond before aborting. Defaults to 60. Set to 0 for infinite timeout.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Use Default Credentials")]
        [Description("When true, sends the current Windows user's credentials (NTLM/Kerberos) with the request. Defaults to false.")]
        [DefaultValue(false)]
        public InArgument<bool> UseDefaultCredentials { get; set; }

        [DisplayName("Ignore SSL Errors")]
        [Description("When true, bypasses SSL/TLS certificate validation errors (e.g., self-signed certificates). Use only in development environments. Defaults to false.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreSslErrors { get; set; }

        [DisplayName("Custom Headers")]
        [Description("Additional HTTP headers to include in the request as key-value pairs. Example: { \"X-Api-Key\": \"abc123\", \"X-Correlation-Id\": \"uuid\" }.")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }

        [DisplayName("Response Body")]
        [Description("The response from the web service. Returns a JsonNode if the response is valid JSON, otherwise returns the raw string.")]
        public OutArgument<object> Result { get; set; }

        [DisplayName("Response Code")]
        [Description("The HTTP status code returned by the server (e.g., 200 for OK, 404 for Not Found).")]
        public OutArgument<int> ResponseCode { get; set; }

        [DisplayName("Response Headers")]
        [Description("All response headers returned by the server as key-value pairs.")]
        public OutArgument<Dictionary<string, string>> ResponseHeaders { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var url = EndpointUrl.Get(context);
            var method = HttpMethod.Get(context);
            var body = RequestBody.Get(context);
            var contentType = ContentType.Get(context) ?? "application/json";
            var acceptType = AcceptHeader.Get(context) ?? "application/json";
            var timeout = TimeoutSeconds.Get(context);
            var useDefaultCreds = UseDefaultCredentials.Get(context);
            var ignoreSsl = IgnoreSslErrors.Get(context);
            var headers = Headers.Get(context);
            var authType = AuthenticationType.Get(context);
            var username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            var bearerToken = BearerToken.Get(context);

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentNullException(nameof(EndpointUrl), "Endpoint URL must be specified.");

            if (!Uri.TryCreate(url, UriKind.Absolute, out var parsedUri) ||
                (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
                throw new ArgumentException($"Endpoint URL must be a valid absolute HTTP or HTTPS URL. Received: '{url}'", nameof(EndpointUrl));

            if (timeout < 0)
                throw new ArgumentOutOfRangeException(nameof(TimeoutSeconds), "Timeout must be zero (infinite) or a positive number of seconds.");

            var task = InvokeWebServiceAsync(
                url, method, body, contentType, acceptType,
                timeout, useDefaultCreds, ignoreSsl, headers,
                authType, username, password, bearerToken);

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
            var responseCode = 0;
            var responseHeaders = new Dictionary<string, string>();

            try
            {
                var response = await task;
                responseCode = (int)response.StatusCode;

                foreach (var header in response.Headers)
                    responseHeaders[header.Key] = string.Join(",", header.Value);

                if (response.Content != null)
                {
                    foreach (var header in response.Content.Headers)
                        responseHeaders[header.Key] = string.Join(",", header.Value);

                    responseContent = await response.Content.ReadAsStringAsync();
                }

                var status = response.IsSuccessStatusCode
                    ? $"Successfully invoked {response.RequestMessage?.Method} on {response.RequestMessage?.RequestUri}"
                    : $"Web service returned error: {response.ReasonPhrase} ({responseCode})";

                Result.Set(context, ParseResponseContent(responseContent));
                ResponseCode.Set(context, responseCode);
                ResponseHeaders.Set(context, responseHeaders);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (TaskCanceledException)
            {
                Result.Set(context, responseContent);
                ResponseCode.Set(context, 0);
                ResponseHeaders.Set(context, responseHeaders);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "The request was cancelled or timed out before receiving a response.");
            }
            catch (HttpRequestException httpEx)
            {
                responseCode = 0;
                if (httpEx.InnerException is WebException webEx && webEx.Response is HttpWebResponse errorResponse)
                    responseCode = (int)errorResponse.StatusCode;

                Result.Set(context, responseContent);
                ResponseCode.Set(context, responseCode);
                ResponseHeaders.Set(context, responseHeaders);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"HTTP request failed: {httpEx.Message}");
            }
            catch (AggregateException ae)
            {
                var ex = ae.InnerException ?? ae;
                responseCode = 0;

                if (ex is TaskCanceledException)
                {
                    Result.Set(context, responseContent);
                    ResponseCode.Set(context, 0);
                    ResponseHeaders.Set(context, responseHeaders);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "The request was cancelled or timed out before receiving a response.");
                    return;
                }

                if (ex is HttpRequestException httpEx && httpEx.InnerException is WebException webEx)
                    if (webEx.Response is HttpWebResponse errorResponse)
                        responseCode = (int)errorResponse.StatusCode;

                Result.Set(context, responseContent);
                ResponseCode.Set(context, responseCode);
                ResponseHeaders.Set(context, responseHeaders);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error invoking web service: {ex.Message}");
            }
            catch (Exception ex)
            {
                Result.Set(context, responseContent);
                ResponseCode.Set(context, responseCode);
                ResponseHeaders.Set(context, responseHeaders);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Unexpected error invoking web service: {ex.Message}");
            }
        }

        private static async Task<HttpResponseMessage> InvokeWebServiceAsync(
            string url, HttpMethodsEnum method, string body, string contentType, string acceptType,
            int timeoutSeconds, bool useDefaultCreds, bool ignoreSsl, Dictionary<string, string> headers,
            AuthenticationTypeEnum authType, string username, string password, string bearerToken)
        {
            var handler = new HttpClientHandler();

            if (useDefaultCreds)
                handler.UseDefaultCredentials = true;

            if (ignoreSsl)
                handler.ServerCertificateCustomValidationCallback = (request, certificate, chain, sslPolicyErrors) => true;

            using (var client = new HttpClient(handler))
            {
                client.Timeout = timeoutSeconds == 0
                    ? System.Threading.Timeout.InfiniteTimeSpan
                    : TimeSpan.FromSeconds(timeoutSeconds);

                client.DefaultRequestHeaders.Accept.Clear();
                if (!string.IsNullOrWhiteSpace(acceptType))
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));

                switch (authType)
                {
                    case AuthenticationTypeEnum.Basic:
                        if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                        {
                            handler.PreAuthenticate = true;
                            handler.Credentials = new NetworkCredential(username, password);
                        }
                        break;
                    case AuthenticationTypeEnum.Bearer:
                        if (!string.IsNullOrWhiteSpace(bearerToken))
                            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
                        break;
                }

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
                        response = await client.PostAsync(url, new StringContent(body ?? "", Encoding.UTF8, contentType));
                        break;
                    case HttpMethodsEnum.PUT:
                        response = await client.PutAsync(url, new StringContent(body ?? "", Encoding.UTF8, contentType));
                        break;
                    case HttpMethodsEnum.DELETE:
                        response = await client.DeleteAsync(url);
                        break;
                    case HttpMethodsEnum.PATCH:
                        response = await client.SendAsync(new HttpRequestMessage(new HttpMethod("PATCH"), url)
                        {
                            Content = new StringContent(body ?? "", Encoding.UTF8, contentType)
                        });
                        break;
                    default:
                        throw new ArgumentException($"Unsupported HTTP method: '{method}'");
                }

                return response;
            }
        }

        private static object ParseResponseContent(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return content;

            try
            {
                return JsonNode.Parse(content);
            }
            catch
            {
                return content;
            }
        }

        public enum HttpMethodsEnum
        {
            [Display(Name = "GET", Description = "Retrieves data from the specified resource.")]
            GET,
            [Display(Name = "POST", Description = "Submits data to be processed to the specified resource.")]
            POST,
            [Display(Name = "PUT", Description = "Replaces the current resource with the provided data.")]
            PUT,
            [Display(Name = "DELETE", Description = "Deletes the specified resource.")]
            DELETE,
            [Display(Name = "PATCH", Description = "Applies partial modifications to a resource.")]
            PATCH
        }

        public enum AuthenticationTypeEnum
        {
            [Display(Name = "None", Description = "No authentication. The request is sent without credentials.")]
            None,
            [Display(Name = "Basic", Description = "HTTP Basic authentication using a username and password.")]
            Basic,
            [Display(Name = "Bearer", Description = "OAuth 2.0 Bearer token authentication.")]
            Bearer
        }
    }
}