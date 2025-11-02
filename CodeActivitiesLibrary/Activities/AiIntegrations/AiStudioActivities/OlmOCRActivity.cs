using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.AIIntegrations.AIStudioActivities
{
    [DisplayName("Olm OCR")]
    [Description("Uploads a PDF file to remote OCR API and returns the markdown result.")]
    public class OlmOCRActivity : BaseAsyncCodeActivity
    {
        [RequiredArgument]
        [DisplayName("API URL")]
        [Description("URL of the OCR API endpoint.")]
        public InArgument<string> ApiUrl { get; set; }

        [RequiredArgument]
        [DisplayName("PDF file path")]
        [Description("Path to the PDF file to be uploaded and OCR'd.")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("OCR markdown output")]
        [Description("Markdown result returned by the Olm OCR API.")]
        public OutArgument<string> OcrText { get; set; }

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var filePath = FilePath.Get(context);
            var apiUrl = ApiUrl.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);
            var accessToken = AccessToken.Get(context);

            var tcs = new TaskCompletionSource<string>(state);

            Task.Run(async () =>
            {
                try
                {
                    // Validate file existence
                    if (!File.Exists(filePath))
                        throw new FileNotFoundException("File not found.", filePath);

                    // Read file and convert to base64
                    var fileBytes = File.ReadAllBytes(filePath);
                    var fileBase64 = Convert.ToBase64String(fileBytes);

                    // Create request object
                    var requestObj = new
                    {
                        file_name = Path.GetFileName(filePath),
                        file_data = fileBase64,
                        ref_type = "Agent",
                        ref_id = agentId,
                        ref_name = agentName,
                        action = "AgentExecution",
                        agent_name = agentName
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

                        // Expecting: { "markdown": "..." }
                        dynamic respObj = JsonConvert.DeserializeObject<dynamic>(respContent) ?? new { markdown = "No markdown returned." };
                        tcs.SetResult(respObj != null && respObj.markdown != null ? (string)respObj.markdown : "No markdown returned.");
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
                var markdown = task.GetAwaiter().GetResult();
                OcrText.Set(context, markdown);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "OCR request succeeded.");
            }
            catch (Exception ex)
            {
                OcrText.Set(context, "No markdown returned.");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            }
        }
    }
}