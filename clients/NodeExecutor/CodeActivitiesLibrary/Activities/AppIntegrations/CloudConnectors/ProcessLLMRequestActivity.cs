using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Linq;
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

        [DisplayName("Knowledge Base Configuration")]
        public InArgument<JToken> KbConfig { get; set; }

        [DisplayName("Memory Configuration")]
        public InArgument<JToken> MemoryConfig { get; set; }

        [DisplayName("Tools Configuration")]
        public InArgument<JToken> ToolsConfig { get; set; }

        [DisplayName("Default Actions Configuration")]
        public InArgument<JToken> RecommendedActionsConfig { get; set; }

        [DisplayName("Result")]
        public OutArgument<JToken> Result { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            // Get api url from config
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/llmpipeline/api/v2/llm/generate";

            // Capture all required values from context at the start
            var modelConfig = ModelConfig.Get(context);
            var inputPrompt = Prompt.Get(context);
            var filesList = Files.Get(context);
            var kbConfig = KbConfig.Get(context);
            var memoryConfig = MemoryConfig.Get(context);
            var toolsConfig = ToolsConfig.Get(context);
            var recommendedActionsConfig = RecommendedActionsConfig.Get(context);

            // Capture agent details and access token
            var accessToken = AccessToken.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);

            // Convert files to base64 if any
            var formattedFilesList = FormatFilesList(filesList);

            // If converted list count not same as original, some files were missing
            if (filesList != null && formattedFilesList.Count != filesList.Count)
                throw new FileNotFoundException("One or more files in the provided Files List were not found.");

            // Get knowledge base names and topK if provided
            var kbNames = kbConfig?["knowledgeBase"]?.ToObject<List<string>>();
            var hasKbNames = kbNames != null && kbNames.Count() > 0;
            var topK = hasKbNames ? (kbConfig?["numberOfChunks"]?.Value<int?>() ?? 5) : (int?)null;

            // Get chat agent parameters from recommendedActionsConfig
            var enableDynamicActions = recommendedActionsConfig?["enableDynamicActions"]?.Value<bool>();
            var followUpMessagePrompt = recommendedActionsConfig?["followUpMessagePrompt"]?.Value<string>();

            // Build the input payload for the LLM request.
            // When followUpMessagePrompt are provided, they are added as the first system message.
            // The agent prompt is added as the next message. If no messages are configured, the original prompt is used as a fallback.
            var input = BuildInputPayload(inputPrompt, followUpMessagePrompt);

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
                        input = input,
                        files = formattedFilesList,
                        is_json_output = modelConfig?["is_json_output"]?.Value<bool?>() ?? false,
                        json_schema = modelConfig?["json_schema"]?.Value<string>(),
                        max_output_tokens = modelConfig?["max_output_tokens"]?.Value<long?>() ?? 0,
                        is_byok_enabled = modelConfig?["is_byok_enabled"]?.Value<bool?>() ?? false,
                        // Canonical key is credential_name.
                        credential_name = modelConfig?["credential_name"]?.Value<string>() ?? string.Empty,
                        temperature = modelConfig?["temperature"]?.Value<double?>() ?? 1,
                        top_p = modelConfig?["top_p"]?.Value<double?>() ?? 1.0,
                        stream = false,
                        ref_type = "Agent",
                        ref_id = agentId,
                        ref_name = agentName,
                        action = "AgentExecution",
                        agent_name = agentName,
                        kb_names = hasKbNames ? kbNames : null,
                        top_k = topK,
                        tool_config = toolsConfig != null ? toolsConfig.ToObject<object>() : null,
                        is_chat_agent = enableDynamicActions == null ? false : true,
                        generate_followup_messages = enableDynamicActions ?? false,
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

        // Builds the input payload format expected by the LLM API.
        private static object BuildInputPayload(string inputPrompt, string followUpMessagePrompt)
        {
            var messages = new List<object>();

            // Add follow-up instructions as the system message to define the expected response behavior.
            if (!string.IsNullOrWhiteSpace(followUpMessagePrompt))
            {
                messages.Add(new
                {
                    role = "system",
                    content = followUpMessagePrompt
                });
            }

            // Add the provided input prompt as the user message.
            if (!string.IsNullOrWhiteSpace(inputPrompt))
            {
                messages.Add(new
                {
                    role = "user",
                    content = inputPrompt
                });
            }

            // Return chat-style messages when any instructions or prompts are configured.
            if (messages.Count > 0)
            {
                return messages;
            }

            // Return an empty string when no input is available.
            return string.Empty;
        }

        private List<string> FormatFilesList(List<string> filesList)
        {
            var result = new List<string>();

            // If no files provided, return null
            if (filesList == null || filesList.Count == 0)
                return result;

            // If file is remote file with http/https or data URI, return as is
            if (filesList.All(f => f.StartsWith("http://") || f.StartsWith("https://") || f.StartsWith("data:")))
                return filesList;

            foreach (var file in filesList)
            {
                // Ignore empty or whitespace-only entries.
                if (string.IsNullOrWhiteSpace(file))
                    continue;

                // Sanitize the file path
                var sanitizedPath = file.Trim();

                // If remote file with http/https or data URI, add as is
                if (sanitizedPath.StartsWith("http://") || sanitizedPath.StartsWith("https://") || sanitizedPath.StartsWith("data:"))
                {
                    result.Add(sanitizedPath);
                    continue;
                }

                // Otherwise, treat as file path - validate file existence
                sanitizedPath = file.Trim('[').Trim(']').Trim('"').Trim();
                if (!File.Exists(sanitizedPath))
                    continue;

                // Read file and convert to data URI format
                var fileBytes = File.ReadAllBytes(sanitizedPath);
                var fileBase64 = Convert.ToBase64String(fileBytes);
                var dataUri = $"data:{GetMimeType(Path.GetExtension(sanitizedPath))};base64,{fileBase64}";
                result.Add(dataUri);
            }
            return result;
        }

        private static string GetMimeType(string fileExtension)
        {
            switch (fileExtension.ToLower())
            {
                case ".txt": return "text/plain";
                case ".pdf": return "application/pdf";
                case ".doc": return "application/msword";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case ".xls": return "application/vnd.ms-excel";
                case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                case ".ppt": return "application/vnd.ms-powerpoint";
                case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".bmp": return "image/bmp";
                case ".tiff":
                case ".tif": return "image/tiff";
                case ".mp4": return "video/mp4";
                case ".webm": return "video/webm";
                case ".mp3": return "audio/mpeg";
                case ".wav": return "audio/wav";
                case ".ogg": return "audio/ogg";
                case ".zip": return "application/zip";
                case ".rar": return "application/x-rar-compressed";
                case ".csv": return "text/csv";
                case ".json": return "application/json";
                case ".xml": return "application/xml";
                default: return "application/octet-stream";
            }
        }
    }
}