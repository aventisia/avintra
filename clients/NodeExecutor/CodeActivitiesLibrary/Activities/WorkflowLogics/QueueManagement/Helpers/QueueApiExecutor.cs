using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers
{
    // Utility class for executing HTTP requests against Queue Management APIs.
    // Follows the same request/response pattern used by ProcessConnectorRequestActivity.
    public static class QueueApiExecutor
    {
        // Executes an HTTP request to the specified Queue Management API endpoint.
        public static Task<JToken> Execute(
             string endpoint,
             HttpMethod method,
             string accessToken,
             object payload = null)
        {
            // Validate input parameters
            if (string.IsNullOrWhiteSpace(endpoint))
                throw new ArgumentNullException(nameof(endpoint));

            if (string.IsNullOrWhiteSpace(accessToken))
                throw new ArgumentNullException(nameof(accessToken));

            // Build API URL
            var baseUrl = ConfigurationManager.AppSettings["APP_BASE_URL"];
            var requestUri = $"{baseUrl.TrimEnd('/')}/{endpoint.TrimStart('/')}";

            // Declare task completion source
            var taskCompletionSource = new TaskCompletionSource<JToken>();

            Task.Run(async () =>
            {
                try
                {
                    using (var client = new HttpClient())
                    {
                        // Set up headers
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                        HttpResponseMessage response;

                        if (method == HttpMethod.Get || method == HttpMethod.Delete)
                        {
                            response = await client.SendAsync(new HttpRequestMessage(method, requestUri));
                        }
                        else
                        {
                            var requestJson = JsonConvert.SerializeObject(
                                payload,
                                new JsonSerializerSettings
                                {
                                    ContractResolver = new CamelCasePropertyNamesContractResolver(),
                                    NullValueHandling = NullValueHandling.Ignore
                                });

                            var content = new StringContent(
                                requestJson,
                                Encoding.UTF8,
                                "application/json");

                            response = await client.SendAsync(
                                new HttpRequestMessage(method, requestUri)
                                {
                                    Content = content
                                });
                        }

                        // Read the body before deciding success: the backend returns handled
                        // failures (e.g. "Queue workitem not found.") as a ServiceResponse envelope
                        // with a non-200 statusCode. Surfacing that message beats a generic
                        // "400 (Bad Request)" from EnsureSuccessStatusCode.
                        var responseContent = await response.Content.ReadAsStringAsync();

                        // Deserialize the response content into a JObject for further processing
                        var responseObj = JsonConvert.DeserializeObject<JObject>(responseContent);

                        // Check the status code in the response and handle accordingly
                        if (responseObj != null)
                        {
                            // Check for a status code in the response and handle errors
                            var statusCode = responseObj["statusCode"]?.ToObject<int>() ?? (int)response.StatusCode;

                            // If the status code is not a 2xx code, surface the server-provided message
                            if (statusCode < 200 || statusCode >= 300)
                            {
                                taskCompletionSource.SetException(
                                    new Exception(
                                        responseObj["message"]?.ToString() ??
                                        $"Request failed with status code {statusCode}."));
                                return;
                            }

                            // If the response contains a "data" property, return it; otherwise, return the entire response object
                            taskCompletionSource.SetResult(responseObj["data"] ?? responseObj);
                        }
                        else
                        {
                            taskCompletionSource.SetException(new Exception("Failed to process API response."));
                        }
                    }
                }
                catch (TaskCanceledException ex)
                {
                    taskCompletionSource.SetException(
                        new TimeoutException(
                            $"Request to '{endpoint}' timed out.",
                            ex));
                }
                catch (HttpRequestException ex)
                {
                    taskCompletionSource.SetException(
                        new HttpRequestException(
                            $"Request to '{endpoint}' failed.",
                            ex));
                }
                catch (Exception ex)
                {
                    taskCompletionSource.SetException(ex);
                }
            });

            return taskCompletionSource.Task;
        }
    }
}