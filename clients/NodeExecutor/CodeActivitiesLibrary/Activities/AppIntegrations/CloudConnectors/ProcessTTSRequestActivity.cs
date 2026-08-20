using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.CloudConnectorsActivities
{
    public class ProcessTTSRequestActivity : BaseAsyncCodeActivity
    {
        /// <summary>
        /// Contains the model/provider configuration required for TTS generation.
        /// </summary>
        [RequiredArgument]
        [DisplayName("Model Configuration")]
        public InArgument<JToken> ModelConfig { get; set; }

        /// <summary>
        /// Contains voice-specific settings such as language, voice, speed, and pitch.
        /// </summary>
        [RequiredArgument]
        [DisplayName("Voice Configuration")]
        public InArgument<JToken> VoiceConfig { get; set; }

        /// <summary>
        /// Text that needs to be converted into speech.
        /// </summary>
        [RequiredArgument]
        [DisplayName("Input Text")]
        public InArgument<string> InputText { get; set; }

        /// <summary>
        /// Stores the API response returned from the TTS service.
        /// </summary>
        [DisplayName("Result")]
        public OutArgument<JToken> Result { get; set; }

        protected override IAsyncResult BeginExecute(
            AsyncCodeActivityContext context,
            AsyncCallback callback,
            object state)
        {
            // Build the Text-to-Speech API endpoint using the configured application base URL.
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/llmpipeline/api/tts/synthesize";

            // Read all required workflow inputs before starting the asynchronous execution.
            var modelConfig = ModelConfig.Get(context);
            var inputText = InputText.Get(context);
            var voiceConfig = VoiceConfig.Get(context);

            // Retrieve agent details and authentication token.
            var accessToken = AccessToken.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);

            // Create a TaskCompletionSource to bridge the async Task with WF's async pattern.
            var taskCompletionSource = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Prepare the request payload expected by the backend TTS API.
                    var requestObj = new
                    {
                        provider = modelConfig?["provider"]?.Value<string>(),
                        input = inputText,
                        model = modelConfig?["model"]?.Value<string>(),
                        is_byok_enabled = modelConfig?["is_byok_enabled"]?.Value<bool?>() ?? false,
                        credential_name = modelConfig?["credential_name"]?.Value<string>() ?? modelConfig?["credential_id"]?.Value<string>(),
                        stream = modelConfig?["stream"]?.Value<bool?>() ?? false,

                        // Voice configuration
                        language = voiceConfig?["language"]?.Value<string>(),
                        voice_id = voiceConfig?["voice"]?.Value<string>(),
                        speed = voiceConfig?["speed"]?.Value<double?>() ?? 1.0,
                        pitch = voiceConfig?["pitch"]?.Value<double?>() ?? 1.0,

                        // Agent metadata
                        ref_type = "Agent",
                        ref_id = agentId,
                        ref_name = agentName,
                        agent_name = agentName,
                        action = "AgentExecution",
                    };

                    // NOTE:
                    // Although 'InputText' is captured above, it is currently not included
                    // in the request payload. Include it here if required by the API.

                    // Serialize the request object into JSON.
                    var requestJson = JsonConvert.SerializeObject(requestObj);

                    using (var client = new HttpClient())
                    {
                        // Configure request headers.
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(
                            new MediaTypeWithQualityHeaderValue("application/json"));

                        client.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Bearer", accessToken);

                        // Create the HTTP request body.
                        var content = new StringContent(
                            requestJson,
                            Encoding.UTF8,
                            "application/json");

                        // Send the request to the backend service.
                        var response = await client.PostAsync(apiUrl, content);

                        // Throw an exception if the response indicates failure.
                        response.EnsureSuccessStatusCode();

                        // Read the response payload.
                        var responseContent = await response.Content.ReadAsStringAsync();

                        // Complete the workflow task with the API response.
                        taskCompletionSource.SetResult(responseContent);
                    }
                }
                catch (Exception ex)
                {
                    // Propagate any exception back to the workflow runtime.
                    taskCompletionSource.SetException(ex);
                }
            })
            .ContinueWith(_ => callback?.Invoke(taskCompletionSource.Task));

            return taskCompletionSource.Task;
        }

        protected override void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<string>)result;

            try
            {
                // Retrieve the API response.
                var responseContent = task.GetAwaiter().GetResult();

                // Deserialize the response into a JObject.
                var responseObj = JsonConvert.DeserializeObject<JObject>(responseContent);

                if (responseObj != null)
                {
                    // Store the successful response.
                    Result.Set(context, responseObj);
                    StatusMessage.Set(context, "Request processed successfully.");
                    IsSuccess.Set(context, true);
                }
                else
                {
                    // Handle the case where the response could not be parsed.
                    Result.Set(context, null);
                    StatusMessage.Set(context, "Failed to process the API response.");
                    IsSuccess.Set(context, false);
                }
            }
            catch (Exception ex)
            {
                // Handle any execution or parsing errors.
                Result.Set(context, null);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}