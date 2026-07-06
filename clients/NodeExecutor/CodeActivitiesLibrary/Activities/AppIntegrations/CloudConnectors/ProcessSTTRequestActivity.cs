using System;
using System.Activities;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Azure.Core;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.CloudConnectorsActivities
{
    public class ProcessSTTRequestActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Model Configuration")]
        public InArgument<JToken> ModelConfig { get; set; }

        [DisplayName("File")]
        public InArgument<string> Files { get; set; }

        [DisplayName("Result")]
        public OutArgument<JToken> Result { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            // Build the Speech-to-Text API endpoint from the application configuration.
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/llmpipeline/api/stt/transcribe";

            // Retrieve workflow inputs required to process the transcription request.
            var modelConfig = ModelConfig.Get(context);
            var filesList = Files.Get(context);

            // Retrieve authentication credentials and agent metadata for the request.
            var accessToken = AccessToken.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);

            // Normalize the supplied file reference into a format supported by the STT service.
            var formattedFile = FormatFile(filesList);

            // Validate that a supported file reference is available before invoking the service.
            if (string.IsNullOrEmpty(formattedFile))
            {
                throw new ArgumentException("Files input is invalid or empty. Please provide a valid file reference.");
            }

            // Bridge the asynchronous task with the Workflow Foundation asynchronous execution model.
            var taskCompletionSource = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Construct the request payload expected by the Speech-to-Text service.
                    var requestObj = new
                    {
                        provider = modelConfig?["provider"]?.Value<string>(),
                        model = modelConfig?["model"]?.Value<string>(),
                        is_byok_enabled = modelConfig?["is_byok_enabled"]?.Value<bool?>() ?? false,
                        credentials_id = modelConfig?["credential_id"]?.Value<string>() ?? Guid.Empty.ToString(),
                        input = formattedFile,
                        language = modelConfig?["language"]?.Value<string>() ?? "en",
                        stream = false,
                        ref_type = "Agent",
                        ref_id = agentId,
                        ref_name = agentName,
                        action = "AgentExecution",
                        agent_name = agentName,
                    };

                    // Serialize the request payload into JSON.
                    var requestJson = JsonConvert.SerializeObject(requestObj);

                    using (var client = new HttpClient())
                    {
                        // Configure the HTTP client with the required request headers.
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Bearer", accessToken);

                        // Create the HTTP request body.
                        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

                        // Submit the transcription request to the backend service.
                        var response = await client.PostAsync(apiUrl, content);

                        // Throw an exception if the request was not successful.
                        response.EnsureSuccessStatusCode();

                        // Read the response returned by the transcription service.
                        var responseContent = await response.Content.ReadAsStringAsync();

                        // Complete the asynchronous workflow task with the API response.
                        taskCompletionSource.SetResult(responseContent);
                    }
                }
                catch (Exception ex)
                {
                    // Propagate any execution errors back to the workflow runtime.
                    taskCompletionSource.SetException(ex);
                }
            })
            .ContinueWith(_ => callback?.Invoke(taskCompletionSource.Task));

            return taskCompletionSource.Task;
        }

        // Handles the completion of the asynchronous execution and processes the API response.
        protected override void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<string>)result;

            try
            {
                // Retrieve the response returned by the completed asynchronous task.
                var responseContent = task.GetAwaiter().GetResult();

                // Deserialize the API response into a JSON object.
                var responseObj = JsonConvert.DeserializeObject<JObject>(responseContent);

                if (responseObj != null)
                {
                    // Store the successful response and update the activity status.
                    Result.Set(context, responseObj);
                    StatusMessage.Set(context, "Request processed successfully.");
                    IsSuccess.Set(context, true);
                }
                else
                {
                    // Handle cases where the API response cannot be parsed.
                    Result.Set(context, null);
                    StatusMessage.Set(context, "Failed to process the API response.");
                    IsSuccess.Set(context, false);
                }
            }
            catch (Exception ex)
            {
                // Capture and report any errors encountered during execution.
                Result.Set(context, null);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
                IsSuccess.Set(context, false);
            }
        }

        // Converts the supplied file reference into a format accepted by the
        // Speech-to-Text service.
        //
        // Supported input formats:
        // - Data URLs (returned unchanged)
        // - HTTP/HTTPS URLs (returned unchanged)
        // - Raw Base64 strings (wrapped as Data URLs)
        // - Local file paths (encoded as Base64 Data URLs)
        // </summary>
        private string FormatFile(string fileReference)
        {
            // Ignore empty or whitespace-only inputs.
            if (string.IsNullOrWhiteSpace(fileReference))
                return string.Empty;

            // Remove any surrounding brackets or quotation marks.
            var value = fileReference.Trim().Trim('[', ']', '"');

            // Data URLs are already in the expected format.
            if (value.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                return value;

            // Public URLs can be forwarded directly to the backend service.
            if (Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
                (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            {
                return value;
            }

            // Wrap raw Base64 content in a generic Data URL.
            if (IsBase64String(value))
                return $"data:application/octet-stream;base64,{value}";

            // Return null if the specified local file cannot be found.
            if (!File.Exists(value))
                return string.Empty;

            // Read the local file and convert it into a Base64-encoded Data URL.
            var mimeType = GetMimeType(Path.GetExtension(value));
            var bytes = File.ReadAllBytes(value);

            return $"data:{mimeType};base64,{Convert.ToBase64String(bytes)}";
        }

        // Determines whether the supplied value is a valid Base64-encoded string.
        private static bool IsBase64String(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
                return false;

            str = str.Trim();

            // A valid Base64 string must have a length that is a multiple of four.
            if (str.Length % 4 != 0)
                return false;

            try
            {
                // Attempt to decode the value to verify its validity.
                Convert.FromBase64String(str);
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Resolves the MIME type for the specified file extension.
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