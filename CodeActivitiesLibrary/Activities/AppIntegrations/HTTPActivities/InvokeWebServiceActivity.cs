using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.HTTPActivities
{
    [DisplayName("Invoke Web Service")]
    [Description("Invokes a web service (REST or SOAP) and returns the response text.")]
    public class InvokeWebServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The URL of the web service endpoint (e.g., https://api.example.com/data).")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method to use: GET, POST, PUT, DELETE, etc.")]
        public InArgument<string> HttpMethod { get; set; }

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

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the service to respond.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Use Default Credentials")]
        [Description("If true, sends credentials of the current user with the request.")]
        public InArgument<bool> UseDefaultCredentials { get; set; }

        [DisplayName("Headers")]
        [Description("Custom HTTP headers to include in the request.")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Result")]
        [Description("Returns the raw response from the web service as a string.")]
        public OutArgument<string> Result { get; set; }


        [DisplayName("Response Code")]
        [Description("Returns the HTTP status code from the web service.")]
        public OutArgument<int> ResponseCode { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var result = "";
            var status = "Operation completed successfully.";
            var responseCode = 0;

            try
            {
                var url = EndpointUrl.Get(context);
                var method = HttpMethod.Get(context);
                var body = RequestBody.Get(context);
                var contentType = ContentType.Get(context);
                var acceptType = AcceptHeader.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));
                var useDefaultCreds = UseDefaultCredentials.Get(context);
                var headers = Headers.Get(context);

                if (string.IsNullOrWhiteSpace(url))
                    throw new ArgumentException("Endpoint URL must be specified.");

                using (var handler = new HttpClientHandler())
                {
                    if (useDefaultCreds && Environment.OSVersion.Platform == PlatformID.Win32NT)
                        handler.UseDefaultCredentials = true;

                    using (var client = new HttpClient(handler) { Timeout = timeout })
                    {
                        // Set Accept header
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Add("Accept", acceptType);

                        // Add custom headers
                        if (headers != null && headers.Count > 0)
                        {
                            foreach (var header in headers)
                            {
                                client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                            }
                        }

                        HttpResponseMessage response = null;

                        switch (method.ToUpperInvariant())
                        {
                            case "GET":
                                response = client.GetAsync(url).Result;
                                break;

                            case "POST":
                                var content = new StringContent(body, System.Text.Encoding.UTF8, contentType);
                                response = client.PostAsync(url, content).Result;
                                break;

                            case "PUT":
                                content = new StringContent(body, System.Text.Encoding.UTF8, contentType);
                                response = client.PutAsync(url, content).Result;
                                break;

                            case "DELETE":
                                response = client.DeleteAsync(url).Result;
                                break;

                            default:
                                throw new ArgumentException($"Unsupported HTTP method: '{method}'.");
                        }

                        responseCode = (int)response.StatusCode;

                        if (response.IsSuccessStatusCode)
                        {
                            result = response.Content.ReadAsStringAsync().Result;
                            status = $"Successfully invoked '{method}' on '{url}'.";
                        }
                        else
                        {
                            result = "";
                            status = $"Web service returned error: {response.ReasonPhrase} ({responseCode})";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error invoking web service: {ex.Message}";
                responseCode = -1;
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
            ResponseCode.Set(context, responseCode);
        }
    }
}