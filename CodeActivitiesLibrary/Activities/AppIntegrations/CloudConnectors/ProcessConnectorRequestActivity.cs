using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
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
        [DisplayName("Credential Id")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Connector Request Payload")]
        public InArgument<string> Payload { get; set; }

        [DisplayName("Data")]
        public OutArgument<JToken> Data { get; set; }

        [DisplayName("Status Code")]
        public OutArgument<int> StatusCode { get; set; }

        // Note: Status message output is already present StatusMessage in BaseAsyncCodeActivity

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            // Get connector provider
            var connectorProvider = Provider.Get(context);
            
            // Get api url from config
            var apiUrl = $"{ConfigurationManager.AppSettings["WorcApiUrl"]}/cloud-connector/{connectorProvider.ToLower()}/invoke";

            // Declare task completion source
            var taskCompletionSource = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Create request object
                    var requestObj = new
                    {
                        provider = connectorProvider,
                        action = Action.Get(context),
                        credentialId = CredentialId.Get(context),
                        payload = Payload.Get(context),
                        agentId = AgentId.Get(context),
                        agentName = AgentName.Get(context)
                    };

                    // Send HTTP POST request
                    var json = JsonConvert.SerializeObject(requestObj);
                    using (var client = new HttpClient())
                    {
                        // Set up headers
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AccessToken.Get(context));

                        // Construct content
                        var content = new StringContent(json, Encoding.UTF8, "application/json");

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
                    Data.Set(context, responseObj["data"]);
                    StatusCode.Set(context, responseObj["statusCode"]?.ToObject<int>());
                    StatusMessage.Set(context, responseObj["message"]?.ToString());
                    IsSuccess.Set(context, responseObj["statusCode"]?.ToObject<int>() == 200);
                }
                else
                {
                    Data.Set(context, null);
                    StatusCode.Set(context, null);
                    StatusMessage.Set(context, "Failed to process the api response.");
                    IsSuccess.Set(context, false);
                }
            }
            catch (Exception ex)
            {
                Data.Set(context, null);
                StatusCode.Set(context, null);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}