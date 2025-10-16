using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AIIntegrations.AIStudioActivities
{

    [DisplayName("Invoke Inference Model Web Service")]
    [Description("Invokes an AI model web service and returns the response text.")]
    public class InvokeInferenceModelWebServiceActivity : BaseAsyncCodeActivity
    {

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

        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The URL of the web service endpoint (e.g., https://api.example.com/v1/completions).")]
        public InArgument<string> EndpointUrl { get; set; }

        // Corrected: Use HttpMethodsEnum directly, default to POST enum value
        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method to use. Commonly POST for model inference.")]
        [DefaultValue(HttpMethodEnum.POST)]
        public InArgument<HttpMethodEnum> HttpMethod { get; set; }

        [DisplayName("Request Body")]
        [Description("The request body to send in POST requests. Use {SelectModel} and {InputText} as placeholders.")]
        public InArgument<string> RequestBody { get; set; }

        [DisplayName("Content Type")]
        [Description("Specifies the content type for the request body.")]
        [DefaultValue("application/json")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Accept Header")]
        [Description("Specifies the content type expected in the response.")]
        [DefaultValue("application/json")]
        public InArgument<string> AcceptHeader { get; set; }

        [DisplayName("Headers")]
        [Description("Custom HTTP headers to include in the request (e.g., specific model service headers).")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }


        [DisplayName("AIModelResult")]
        [Description("Returns the raw response from the web service as a string.")]
        public OutArgument<string> AIModelResult { get; set; }

        [DisplayName("Response Code")]
        [Description("Returns the HTTP status code from the web service.")]
        public OutArgument<int> ResponseCode { get; set; }


        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var url = EndpointUrl.Get(context);
            // Corrected: Get the HTTP Method enum value, defaulting correctly via property initialization
            var httpMethodEnum = HttpMethod.Get(context);
            var selectModel = SelectModel.Get(context);
            var inputText = InputText.Get(context);
            var modelApiKey = ModelApiKey.Get(context);
            var bodyTemplate = RequestBody.Get(context);
            var contentType = ContentType.Get(context) ?? "application/json";
            var acceptType = AcceptHeader.Get(context) ?? "application/json";
            var headers = Headers.Get(context);
            var jwt = AccessToken.Get(context);

            // Build the request body as an object, not a string
            inputText = inputText?.ToString()?.Trim() ?? "";
            object requestBodyObj = new
            {
                modelId = selectModel,
                aiProjectVersionId = selectModel,
                content = inputText,
            };

            var body = System.Text.Json.JsonSerializer.Serialize(requestBodyObj);

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Endpoint URL must be specified.");
            // Optional checks - might be needed depending on API, but body can sometimes be empty
            // if (string.IsNullOrWhiteSpace(selectModel))
            //     throw new ArgumentException("Select Model must be specified.");
            // if (string.IsNullOrWhiteSpace(inputText))
            //     throw new ArgumentException("Input Text must be specified.");
            if (string.IsNullOrWhiteSpace(modelApiKey))
                throw new ArgumentException("Model API Key must be specified.");

            var task = InvokeWebServiceAsync(
                url, httpMethodEnum, body, contentType, acceptType,
                headers, jwt
               );

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
            var isSuccess = false;

            try
            {
                var response = await task;
                responseCode = (int)response.StatusCode;
                isSuccess = response.IsSuccessStatusCode;

                // Optional: Capture response headers if needed
                // foreach (var header in response.Headers)
                // {
                //     responseHeaders[header.Key] = string.Join(",", header.Value);
                // }
                // if (response.Content != null)
                // {
                //     foreach (var header in response.Content.Headers)
                //     {
                //         responseHeaders[header.Key] = string.Join(",", header.Value);
                //     }
                // }

                if (response.Content != null)
                {
                    responseContent = await response.Content.ReadAsStringAsync();
                }

                status = response.IsSuccessStatusCode
                    ? $"Successfully invoked model at {response.RequestMessage?.RequestUri}"
                    : $"Model service returned error: {response.ReasonPhrase} ({responseCode})";

                AIModelResult.Set(context, responseContent);
                IsSuccess.Set(context, isSuccess);
                StatusMessage.Set(context, status);
                ResponseCode.Set(context, responseCode);
            }
            catch (Exception ex)
            {
                responseContent = "";
                status = $"Error invoking model service: {ex.GetBaseException().Message}";
                responseCode = -1;
                isSuccess = false;

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                AIModelResult.Set(context, responseContent);
                ResponseCode.Set(context, responseCode);
            }
        }

        // Corrected method signature to accept HttpMethodsEnum
        private static async Task<HttpResponseMessage> InvokeWebServiceAsync(
           string url, HttpMethodEnum method, string body, string contentType, string acceptType,
            Dictionary<string, string> headers, string jwt
          )
        {
            var handler = new HttpClientHandler();
            using (var client = new HttpClient(handler))
            {

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));

                // If jwt is not null
                if (jwt != null)
                {
                    // Set the Bearer token in Authorization header
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
                }

                // Add custom headers
                if (headers != null)
                    foreach (var header in headers)
                        client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                HttpResponseMessage response;
                switch (method)
                {
                    case HttpMethodEnum.GET:
                        response = await client.GetAsync(url);
                        break;
                    case HttpMethodEnum.POST:
                        var postContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PostAsync(url, postContent);
                        break;
                    case HttpMethodEnum.PUT:
                        var putContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                        response = await client.PutAsync(url, putContent);
                        break;
                    case HttpMethodEnum.DELETE:
                        response = await client.DeleteAsync(url);
                        break;
                    case HttpMethodEnum.PATCH:
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
}