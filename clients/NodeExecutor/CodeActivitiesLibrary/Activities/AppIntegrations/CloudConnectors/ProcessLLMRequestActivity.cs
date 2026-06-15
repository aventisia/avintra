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
            var formattedFilesList = FormatFilesList(filesList);

            // If converted list count not same as original, some files were missing
            if (filesList != null && formattedFilesList.Count != filesList.Count)
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
                        files = formattedFilesList,
                        is_json_output = modelConfig?["is_json_output"]?.Value<bool?>() ?? false,
                        json_schema = modelConfig?["json_schema"]?.Value<string>(),
                        max_output_tokens = modelConfig?["max_output_tokens"]?.Value<long?>() ?? 0,
                        is_byok_enabled = modelConfig?["is_byok_enabled"]?.Value<bool?>() ?? false,
                        credential_id = modelConfig?["credential_id"]?.Value<string>() ?? Guid.Empty.ToString(),
                        temperature = modelConfig?["temperature"]?.Value<double?>() ?? 1,
                        top_p = modelConfig?["top_p"]?.Value<double?>() ?? 1.0,
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

        /// <summary>
        /// Formats a list of file references into a normalized list of strings.
        /// Supported inputs:
        /// - Data URLs (returned as-is)
        /// - HTTP/HTTPS URLs (returned as-is)
        /// - Raw Base64 strings (converted to Data URLs)
        /// - Local file paths (read and converted to Data URLs)
        /// </summary>
        private List<string> FormatFilesList(List<string> filesList)
        {
            // Return empty list if no files were provided
            if (filesList == null || filesList.Count == 0)
                return new List<string>();

            var result = new List<string>();

            foreach (var item in filesList)
            {
                // Skip null or empty values
                if (string.IsNullOrWhiteSpace(item))
                    continue;

                // Remove wrapping brackets/quotes if present
                var value = item.Trim().Trim('[', ']', '"');

                // Already a Data URL, no processing required
                if (value.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                {
                    result.Add(value);
                    continue;
                }

                // Public HTTP/HTTPS URL, return as-is
                if (Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
                    (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                {
                    result.Add(value);
                    continue;
                }

                // Raw Base64 content, convert to a generic Data URL
                if (IsBase64String(value))
                {
                    result.Add($"data:application/octet-stream;base64,{value}");
                    continue;
                }

                // Skip invalid file paths
                if (!File.Exists(value))
                    continue;

                // Read local file and convert to Base64 Data URL
                var mimeType = GetMimeType(Path.GetExtension(value));
                var fileBytes = File.ReadAllBytes(value);
                var fileBase64 = Convert.ToBase64String(fileBytes);

                result.Add($"data:{mimeType};base64,{fileBase64}");
            }

            return result;
        }

        /// <summary>
        /// Determines whether the supplied string is a valid Base64 string.
        /// </summary>
        private static bool IsBase64String(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
                return false;

            str = str.Trim();

            // Base64 length must be divisible by 4
            if (str.Length % 4 != 0)
                return false;

            try
            {
                Convert.FromBase64String(str);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Returns the MIME type for a file extension. Falls back to application/octet-stream for unknown types.
        /// </summary>
        private static string GetMimeType(string fileExtension)
        {
            switch (fileExtension.ToLowerInvariant())
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
                case ".tif":
                case ".tiff": return "image/tiff";

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