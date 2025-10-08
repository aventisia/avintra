using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json; 
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AiIntegrations.AiStudioActivities
{

    [DisplayName("Upload File to Server")]
    [Description("Uploads a file to a web API endpoint using multipart/form-data and returns the uploaded file ID .")]
    public class UploadFileToAIModelActivity : BaseAsyncCodeActivity
    {
        #region Input Arguments
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("Full path to the file to upload (e.g., C:\\temp\\document.pdf).")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("API Endpoint URL")]
        [Description("The target API URL for uploading the file (e.g., https://api.example.com/upload-doc).")]
        public InArgument<string> ApiUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Bearer Token")]
        [Description("JWT Bearer token for authentication (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...).")]
        public InArgument<string> BearerToken { get; set; }
        #endregion

        #region Output Arguments

        [DisplayName("Uploaded File Id")]
        [Description("Unique ID extracted from the uploaded file path (e.g., 42a6b659-6f53-478e-9299-dbec2216fad2).")]
        public OutArgument<string> UploadedFileId { get; set; }

        [DisplayName("Response Code")]
        [Description("HTTP status code returned by the server.")]
        public OutArgument<int> ResponseCode { get; set; }

        [DisplayName("Response Message")]
        [Description("Message returned from the upload operation.")]
        public OutArgument<string> ResponseMessage { get; set; }
        #endregion

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var filePath = FilePath.Get(context);
            var apiUrl = ApiUrl.Get(context);
            var token = BearerToken.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path is required.");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {filePath}");

            if (string.IsNullOrWhiteSpace(apiUrl))
                throw new ArgumentException("API URL is required.");

            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Bearer token is required.");

            var task = Task.Run(() => UploadFileAsync(apiUrl, filePath, token));

            var tcs = new TaskCompletionSource<UploadResult>(state);

            task.ContinueWith(t =>
            {
                if (t.IsFaulted && t.Exception != null)
                    tcs.TrySetException(t.Exception.InnerExceptions);
                else if (t.IsCanceled)
                    tcs.TrySetCanceled();
                else
                    tcs.TrySetResult(t.Result);

                callback?.Invoke(tcs.Task);
            });

            return tcs.Task;
        }

        protected override void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<UploadResult>)result;
            try
            {
                var res = task.GetAwaiter().GetResult();
                UploadedFileId.Set(context, res.UploadedFileId);
                ResponseCode.Set(context, res.StatusCode);
                ResponseMessage.Set(context, res.Message);
            }
            catch (Exception ex)
            {
                UploadedFileId.Set(context, null);
                ResponseCode.Set(context, -1);
                ResponseMessage.Set(context, $"Exception: {ex.InnerException?.Message ?? ex.Message}");
            }
        }

        private class UploadResult
        {
            public int StatusCode { get; set; }
            public string Message { get; set; }
            public string UploadedFilePath { get; set; }
            public string UploadedFileId { get; set; }
        }

        private static async Task<UploadResult> UploadFileAsync(string apiUrl, string filePath, string bearerToken)
        {
            if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
            {
                throw new FileNotFoundException("File not found.", filePath);
            }

            // Infer MIME type from extension
            string mimeType = GetMimeType(Path.GetExtension(filePath).ToLowerInvariant());
            string fileName = Path.GetFileName(filePath);

            var client = new HttpClient();
            var formData = new MultipartFormDataContent();

            // Add file content
            var fs = File.OpenRead(filePath);
            var fileContent = new StreamContent(fs);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            formData.Add(fileContent, "files", fileName);

            // Set Authorization header
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

            // Send request
            HttpResponseMessage response = await client.PostAsync(apiUrl, formData);
            string content = await response.Content.ReadAsStringAsync();

            var result = new UploadResult
            {
                StatusCode = (int)response.StatusCode,
                Message = content
            };

            if (!response.IsSuccessStatusCode)
            {
                result.Message = $"HTTP {(int)response.StatusCode}: {content}";
                return result;
            }

            try
            {
                //  Parse JSON using Newtonsoft.Json (JObject)
                var json = JObject.Parse(content);

                // Extract message
                if (json["message"] != null)
                {
                    result.Message = json["message"].ToString();
                }

                // Extract path from data[0].path
                if (json["data"] != null && json["data"].Type == JTokenType.Array && json["data"].Count() > 0)
                {
                    var firstItem = json["data"][0];
                    if (firstItem["path"] != null)
                    {
                        result.UploadedFilePath = firstItem["path"].ToString();

                        // Extract ID: e.g., "/files/default-files/f97bf310-5969-4dfc-8f94-fc297bb1a8c3.txt"
                        if (!string.IsNullOrEmpty(result.UploadedFilePath))
                        {
                            string[] parts = result.UploadedFilePath.Split('/');
                            string lastPart = parts[parts.Length - 1];
                            int dotIndex = lastPart.LastIndexOf('.');
                            if (dotIndex > 0)
                                result.UploadedFileId = lastPart.Substring(0, dotIndex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message += $"\nJSON parsing error: {ex.Message}";
            }

            return result;
        }

        private static string GetMimeType(string extension)
        {
            switch (extension)
            {
                case ".pdf":
                    return "application/pdf";
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".txt":
                    return "text/plain";
                case ".json":
                    return "application/json";
                case ".xml":
                    return "application/xml";
                case ".csv":
                    return "text/csv";
                default:
                    return "application/octet-stream";
            }
        }
    }
}