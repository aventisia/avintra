using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations; 
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AiIntegrations.AiStudioActivities
{
    [DisplayName("Invoke Inference Model Web Service")]
    [Description("Invokes an AI model web service and returns the response text.")]
    public class InvokeInfrencingModelWebServiceActivity : BaseAsyncCodeActivity
    {
        #region Input Arguments

        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The URL of the web service endpoint (e.g., https://api.example.com/v1/completions).")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Select Model")]
        [Description("The name or identifier of the model to invoke (e.g., gpt-3.5-turbo).")]
        public InArgument<string> SelectModel { get; set; }

        [RequiredArgument]
        [DisplayName("Input Text")]
        [Description("The input text or prompt to send to the model.")]
        public InArgument<string> InputText { get; set; }
      
        [DisplayName("Model API Key")]
        [Description("The API key required to authenticate with the model service.")]
        public InArgument<string> ModelApiKey { get; set; }

        // Modified: Defaulted to POST and changed type to string for simplicity based on your request
        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method to use. Commonly POST for model inference.")]
        [DefaultValue("POST")] 
        public InArgument<string> HttpMethod { get; set; }

        [DisplayName("Request Body")]
        [Description("The request body to send in POST requests.")]
        public InArgument<string> RequestBody { get; set; }

        [DisplayName("Content Type")]
        [Description("Specifies the content type for the request body.")]
        [DefaultValue("application/json")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Accept Header")]
        [Description("Specifies the content type expected in the response.")]
        [DefaultValue("application/json")]
        public InArgument<string> AcceptHeader { get; set; }

        [DisplayName("Authentication Type")]
        [Description("Type of authentication to use. For Model API Key, Bearer is typically used.")]
        [DefaultValue(AuthenticationTypesEnum.Bearer)]
        public InArgument<AuthenticationTypesEnum> AuthenticationType { get; set; } 

        // Note: Username/Password removed as they are less relevant for API Key auth,
        // but BearerToken logic is adapted to use ModelApiKey internally.

        [DisplayName("Use Default Credentials")]
        [Description("If true, sends credentials of the current user with the request.")]
        public InArgument<bool> UseDefaultCredentials { get; set; }

        [DisplayName("Ignore SSL Errors")]
        [Description("If true, ignores SSL certificate validation errors.")]
        public InArgument<bool> IgnoreSslErrors { get; set; }

        [DisplayName("Headers")]
        [Description("Custom HTTP headers to include in the request (e.g., specific model service headers).")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }

        #endregion

        #region Output Arguments

        [DisplayName("Result")]
        [Description("Returns the raw response from the web service as a string.")]
        public OutArgument<string> Result { get; set; }

        [DisplayName("Response Code")]
        [Description("Returns the HTTP status code from the web service.")]
        public OutArgument<int> ResponseCode { get; set; }

        #endregion

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var url = EndpointUrl.Get(context);
            // Get the HTTP Method, defaulting to "POST" if not provided or empty/null
            var methodString = HttpMethod.Get(context) ?? "POST";
            if (string.IsNullOrWhiteSpace(methodString))
            {
                methodString = "POST";
            }

            var selectModel = SelectModel.Get(context);
            var inputText = InputText.Get(context);
            var modelApiKey = ModelApiKey.Get(context);
            var bodyTemplate = RequestBody.Get(context);

            // Create the request body based on template or default structure
            var body = CreateRequestBody(selectModel, inputText, bodyTemplate);

            var contentType = ContentType.Get(context);
            var acceptType = AcceptHeader.Get(context);           
            var useDefaultCreds = UseDefaultCredentials.Get(context);
            var ignoreSsl = IgnoreSslErrors.Get(context);
            var headers = Headers.Get(context);
            // Force Authentication Type to Bearer for API Key usage, or get the provided value
            var authType = AuthenticationTypesEnum.Bearer; // Default for API Key
            // If you want to allow other auth types via the argument, uncomment the next line:
            // var authType = AuthenticationType.Get(context); 

            // Use ModelApiKey as the Bearer Token
            var bearerToken = modelApiKey;

            // Username and Password are not used with ModelApiKey/Bearer in this setup
            var username = "";
            var password = "";

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Endpoint URL must be specified.");
            if (string.IsNullOrWhiteSpace(selectModel))
                throw new ArgumentException("Select Model must be specified.");
            if (string.IsNullOrWhiteSpace(inputText))
                throw new ArgumentException("Input Text must be specified.");
            if (string.IsNullOrWhiteSpace(modelApiKey))
                throw new ArgumentException("Model API Key must be specified.");

            var task = InvokeWebServiceAsync(
                url, methodString, body, contentType, acceptType,
                useDefaultCreds, ignoreSsl, headers,
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
            var status = "Operation completed.";
            var responseCode = 0;
            var responseHeaders = new Dictionary<string, string>();
            var isSuccess = false; // Initialize isSuccess

            try
            {
                var response = await task;
                responseCode = (int)response.StatusCode;
                isSuccess = response.IsSuccessStatusCode; // Set isSuccess based on response

                foreach (var header in response.Headers)
                {
                    responseHeaders[header.Key] = string.Join(",", header.Value);
                }
                if (response.Content != null)
                {
                    foreach (var header in response.Content.Headers)
                    {
                        responseHeaders[header.Key] = string.Join(",", header.Value);
                    }
                    responseContent = await response.Content.ReadAsStringAsync();
                }

                status = response.IsSuccessStatusCode
                    ? $"Successfully invoked model at {response.RequestMessage?.RequestUri}"
                    : $"Model service returned error: {response.ReasonPhrase} ({responseCode})";

                Result.Set(context, responseContent);
                // Set IsSuccess and StatusMessage which were referenced in the original but missing as OutArguments
                IsSuccess.Set(context, isSuccess);
                StatusMessage.Set(context, status);
                ResponseCode.Set(context, responseCode);
               
            }
            catch (Exception ex) // Catch general exceptions
            {
                responseContent = "";
                status = $"Error invoking model service: {ex.GetBaseException().Message}";
                responseCode = -1;
                isSuccess = false;

                // Set outputs even in case of error
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                Result.Set(context, responseContent);
                ResponseCode.Set(context, responseCode);
              
            }
        }

        private string CreateRequestBody(string selectModel, string inputText, string bodyTemplate)
        {
            if (!string.IsNullOrWhiteSpace(bodyTemplate))
            {
                // Replace placeholders in the template
                return bodyTemplate
                    .Replace("{SelectModel}", selectModel ?? "")
                    .Replace("{InputText}", inputText ?? "");
            }
            else
            {
                // Default JSON structure - adjust based on your specific model API requirements
                // Example for OpenAI-like APIs:
                return $"{{\"model\": \"{selectModel}\", \"prompt\": \"{inputText}\"}}";
                // Example for Chat models:
                // return $"{{\"model\": \"{selectModel}\", \"messages\": [{{\"role\": \"user\", \"content\": \"{inputText}\"}}]}}";
            }
        }

        // This method signature is kept mostly the same, adapting string method
        private static async Task<HttpResponseMessage> InvokeWebServiceAsync(
            string url, string methodString, string body, string contentType, string acceptType,
             bool useDefaultCreds, bool ignoreSsl, Dictionary<string, string> headers,
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
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));

                // Set authentication based on the provided type and credentials/token
                if (!string.IsNullOrWhiteSpace(authType))
                    switch (authType.ToLower())
                    {
                        case "basic":
                            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                            {
                                // Note: byteArray creation was in the original, but handler.Credentials is preferred for Basic Auth
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
                // Use the string method value
                switch (methodString.ToUpper())
                {
                    case "GET":
                        response = await client.GetAsync(url);
                        break;
                    case "POST":
                        var postContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PostAsync(url, postContent);
                        break;
                    case "PUT":
                        var putContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PutAsync(url, putContent);
                        break;
                    case "DELETE":
                        response = await client.DeleteAsync(url);
                        break;
                    case "PATCH":
                        var patchContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.SendAsync(new HttpRequestMessage(new HttpMethod("PATCH"), url)
                        { Content = patchContent });
                        break;
                    default:
                        throw new ArgumentException($"Unsupported HTTP method: '{methodString}'");
                }
                return response;
            }
        }

        // Keep the AuthenticationTypesEnum from the original file
        public enum AuthenticationTypesEnum
        {
            [Display(Name = "Basic", Description = "Uses Basic authentication with username and password.")]
            Basic,
            [Display(Name = "Bearer", Description = "Uses Bearer token authentication (commonly used with API Keys).")]
            Bearer
        }
    }
}