using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.CloudConnectorsActivities
{
    // This activity will not be visible in node selector, so No display name and description required
    public class ProcessConnectorRequestActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connector Provider")]
        public InArgument<string> Provider { get; set; }

        [RequiredArgument]
        [DisplayName("Connector Unique Name")]
        public InArgument<string> Action { get; set; }
        
        [RequiredArgument]
        [DisplayName("Credential Name")]
        public InArgument<string> CredentialName { get; set; }

        [RequiredArgument]
        [DisplayName("Connector Request Payload")]
        public InArgument<string> Payload { get; set; }

        [DisplayName("Result")]
        public OutArgument<JToken> Result { get; set; }

        
        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            // Capture all required values from context at the start
            var connectorProvider = Provider.Get(context);
            var action = Action.Get(context);
            var credentialName = CredentialName.Get(context);
            var payload = ParsePayloadForCamelCase(Payload.Get(context)) ;
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);
            var accessToken = AccessToken.Get(context);

            // Get api url from config
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/workspace/api/cloud-connector/{connectorProvider.ToLower()}/invoke";

            // Declare task completion source
            var taskCompletionSource = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Create request object
                    var requestObj = new
                    {
                        agentId = agentId,
                        agentName = agentName,
                        provider = connectorProvider,
                        action = action,
                        credentialName = credentialName,
                        payload = payload
                    };


                    // Ensure camelCase serialization
                    var requestJson = JsonConvert.SerializeObject(requestObj, new JsonSerializerSettings
                    {
                        ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                    });

                    // Send HTTP POST request
                    using (var client = new HttpClient())
                    {
                        // Set up headers
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                        // Construct content
                        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

                        // Post to API
                        var response = await client.PostAsync(apiUrl, content);
                        response.EnsureSuccessStatusCode();
                        var responseContent = await response.Content.ReadAsStringAsync();

                        // Set result
                        taskCompletionSource.SetResult(responseContent);
                    }
                }
                catch (Exception ex)
                {
                    taskCompletionSource.SetException(ex);
                }
            }).ContinueWith(_ => callback?.Invoke(taskCompletionSource.Task));

            return taskCompletionSource.Task;
        }

        protected override void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<string>)result;
            try
            {
                var responseContent = task.GetAwaiter().GetResult();

                // Parse the API response
                var responseObj = JsonConvert.DeserializeObject<JObject>(responseContent);
                if (responseObj != null)
                {
                    Result.Set(context, responseObj["data"]);
                    StatusMessage.Set(context, responseObj["statusCode"].ToString() + ":" + responseObj["message"]?.ToString());
                    IsSuccess.Set(context, responseObj["statusCode"]?.ToObject<int>() == 200);
                }
                else
                {
                    Result.Set(context, null);
                    StatusMessage.Set(context, "Failed to process the api response.");
                    IsSuccess.Set(context, false);
                }
            }
            catch (Exception ex)
            {
                Result.Set(context, null);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
                IsSuccess.Set(context, false);
            }
        }

        /// <summary>
        /// Parses a JSON string payload into a Dictionary so that camelCase contract resolver applies during serialization.
        /// Falls back to JObject or string if not valid JSON.
        /// </summary>
        /// <param name="payloadString">The payload string to parse.</param>
        /// <returns>Parsed object for payload property.</returns>
        private object ParsePayloadForCamelCase(string payloadString)
        {
            if (!string.IsNullOrWhiteSpace(payloadString))
            {
                try
                {
                    return JsonConvert.DeserializeObject<Dictionary<string, object>>(payloadString);
                }
                catch
                {
                    try { return JObject.Parse(payloadString); }
                    catch { return payloadString; } // fallback: send as string if not valid JSON
                }
            }
            else
            {
                return new Dictionary<string, object>(); // send empty object if no payload
            }
        }
    }
}