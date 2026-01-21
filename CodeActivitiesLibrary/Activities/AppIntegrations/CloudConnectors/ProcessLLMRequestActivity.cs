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
    public class ProcessLLMRequestActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Model Configuration")]
        public InArgument<JToken> ModelConfig { get; set; }

        [RequiredArgument]
        [DisplayName("Prompt")]
        public InArgument<string> Prompt { get; set; }

        [DisplayName("Files List")]
        public InArgument<List<string>> Files { get; set; }

        public InArgument<JToken> KbConfig { get; set; }

        public InArgument<JToken> MemoryConfig { get; set; }

        public InArgument<JToken> ToolsConfig { get; set; }

        [DisplayName("Result")]
        public OutArgument<JToken> Result { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            // Get api url from config
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/llmpipeline/api/llm/generate";

            // Capture all required values from context at the start
            var modelConfig = ModelConfig.Get(context);
            var prompt = Prompt.Get(context);
            var filesList = Files.Get(context);
            var kbConfig = KbConfig.Get(context);
            var memoryConfig = MemoryConfig.Get(context);
            var toolsConfig = ToolsConfig.Get(context);

            // Capture agent details and access token
            var accessToken = AccessToken.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);

            // Convert files to base64 if any
            var filesListBase64 = ConvertFileToBase64(filesList);

            // If converted list count not same as original, some files were missing
            if (filesList != null && filesListBase64.Count != filesList.Count)
            {
                throw new FileNotFoundException("One or more files in the provided Files List were not found.");
            }

            // Declare task completion source
            var taskCompletionSource = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Create request object
                    var requestObj = new
                    {
                        provider = modelConfig?["provider"]?.Value<string>(),
                        model = modelConfig?["model"]?.Value<string>(),
                        input = prompt ?? "",
                        files = filesListBase64,
                        is_json_output = modelConfig?["is_json_output"]?.Value<bool>() ?? false,
                        json_schema = modelConfig?["json_schema"]?.Value<string>(),
                        max_output_tokens = modelConfig?["max_output_tokens"]?.Value<long>() ?? 0,
                        is_byok_enabled = modelConfig?["is_byok_enabled"]?.Value<bool>() ?? false,
                        credential_id = modelConfig?["credential_id"]?.Value<string>() ?? Guid.Empty.ToString(),
                        temperature = modelConfig?["temperature"]?.Value<double>() ?? 0.0,
                        top_p = modelConfig?["top_p"]?.Value<double>() ?? 1.0,
                        stream = false,
                        ref_type = "Agent",
                        ref_id = agentId,
                        ref_name = agentName,
                        action = "AgentExecution",
                        agent_name = agentName,
                    };

                    // Convert request object to JSON
                    var requestJson = JsonConvert.SerializeObject(requestObj);

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
                    Result.Set(context, responseObj);
                    StatusMessage.Set(context, "Request processed successfully.");
                    IsSuccess.Set(context, true);
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

        private List<string> ConvertFileToBase64(List<string> filesList)
        {
            if (filesList == null || filesList.Count == 0)
                return null;

            var base64Files = new List<string>();
            foreach (var filePathOrBase64 in filesList)
            {
                // If string is already base64, use it directly
                if (IsBase64String(filePathOrBase64))
                {
                    base64Files.Add(filePathOrBase64);
                    continue;
                }

                // Otherwise, treat as file path - validate file existence
                if (!File.Exists(filePathOrBase64))
                    continue;

                // Read file and convert to base64
                var fileBytes = File.ReadAllBytes(filePathOrBase64);
                var fileBase64 = Convert.ToBase64String(fileBytes);
                base64Files.Add(fileBase64);
            }
            return base64Files;
        }

        private static bool IsBase64String(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
                return false;

            // Remove whitespace
            str = str.Trim();

            // Base64 string length must be a multiple of 4
            if (str.Length % 4 != 0)
                return false;

            try
            {
                // Try to convert from base64
                Convert.FromBase64String(str);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}