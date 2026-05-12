using System;
using System.Activities;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("Extract File Text")]
    [Description("Extracts text from a file using the Aventisia cloud API. Supported formats: .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .tif, .docx, .xlsx, .txt, .csv, .rtf, .odt, .md")]
    [ActivityMetaData(nodeImg: "/assets/File.svg")]
    public class ExtractFileTextActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File path")]
        [Description("Path to the file to be uploaded and processed. Supported formats: .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .tif, .docx, .xlsx, .txt, .csv, .rtf, .odt, .md")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("Extracted Text")]
        [Description("Extracted text returned by the Aventisia cloud API.")]
        public OutArgument<string> ExtractedText { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var apiUrl = $"{ConfigurationManager.AppSettings["APP_BASE_URL"]}/llmpipeline/api/extract-file-text";
            var filePath = FilePath.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);
            var accessToken = AccessToken.Get(context);

            // Convert the local file to data:mime;base64,... if required
            var formattedFile = FormatFile(filePath);

            var tcs = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Create request object
                    var requestObj = new
                    {
                        file = formattedFile,
                    };

                    // Send HTTP POST request
                    var json = JsonConvert.SerializeObject(requestObj);
                    using (var client = new HttpClient())
                    {
                        // Set up headers
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                        // Construct content
                        var content = new StringContent(json, Encoding.UTF8, "application/json");

                        // Post to API
                        var response = await client.PostAsync(apiUrl, content);
                        response.EnsureSuccessStatusCode();
                        var respContent = await response.Content.ReadAsStringAsync();

                        // Expecting response in string only
                        tcs.SetResult(respContent);
                    }
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex);
                }
            }).ContinueWith(_ => callback?.Invoke(tcs.Task));

            return tcs.Task;
        }

        protected override void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<string>)result;
            try
            {
                var extractedText = task.GetAwaiter().GetResult();
                ExtractedText.Set(context, extractedText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text extraction request succeeded.");
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, "No text returned.");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            }
        }


        private string FormatFile(string filePath)
        {
            // If file is remote file with http/https, return as is
            if (Uri.IsWellFormedUriString(filePath, UriKind.Absolute) &&
                (filePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                 filePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
            {
                return filePath;
            }

            // If string is already in Data URI base64 format, use it directly (raw base64 strings are not accepted, it must be in data URI format)
            if (IsDataUriBase64(filePath))
                return filePath;
            
            // Otherwise, treat as file path - validate file existence
            var sanitizedPath = filePath.Trim('[').Trim(']').Trim('"').Trim();
            if (!File.Exists(sanitizedPath))
                throw new FileNotFoundException("File not found.", sanitizedPath);

            var mimeType = AllowedMimeType(Path.GetExtension(sanitizedPath));
            if (string.IsNullOrWhiteSpace(mimeType))
                throw new NotSupportedException($"Unsupported file type: {Path.GetExtension(sanitizedPath)}");

            // Read file and convert to base64
            var fileBytes = File.ReadAllBytes(sanitizedPath);
            var fileBase64 = Convert.ToBase64String(fileBytes);

            return $"data:{mimeType};base64,{fileBase64}";
        }

        private static bool IsDataUriBase64(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
                return false;

            return str.Trim().StartsWith("data:", StringComparison.OrdinalIgnoreCase) &&
                   str.IndexOf(";base64,", StringComparison.OrdinalIgnoreCase) > 5;
        }

        private static string AllowedMimeType(string fileExtension)
        {
            switch (fileExtension.ToLower())
            {
                case ".pdf": return "application/pdf";
                case ".png": return "image/png";
                case ".jpg": return "image/jpeg";
                case ".jpeg": return "image/jpeg";
                case ".bmp": return "image/bmp";
                case ".tiff": return "image/tiff";
                case ".tif": return "image/tiff";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                case ".txt": return "text/plain";
                case ".csv": return "text/csv";
                case ".rtf": return "text/rtf";
                case ".odt": return "application/vnd.oasis.opendocument.text";
                case ".md": return "text/markdown";
                default: return null;
            }
        }
    }
}