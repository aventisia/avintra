using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace CodeActivitiesLibrary.AIIntegrations.AIStudioActivities 
{
    [DisplayName("Ollama Connector")]
    [Description("Invokes Ollama models (Generate or Chat mode) via its local REST API and returns the response.")]
    public class OllamaConnectorActivity : BaseAsyncCodeActivity
    {
        // -------------------------------
        // INPUT ARGUMENTS
        // -------------------------------

        [RequiredArgument]
        [DisplayName("Base URL")]
        [Description("The Ollama server base URL (default: http://localhost:11434).")]
        [DefaultValue("http://localhost:11434")]
        public InArgument<string> BaseUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Model")]
        [Description("The Ollama model to use (e.g., llama2, mistral, codellama). Must be pulled into Ollama first.")]
        public InArgument<string> Model { get; set; }

        [DisplayName("Prompt")]
        [Description("The text prompt for Generate mode or extra user message in Chat mode.")]
        public InArgument<string> Prompt { get; set; }

        [DisplayName("Mode")]
        [Description("Choose whether to run Generate (/api/generate) or Chat (/api/chat).")]
        [DefaultValue(OllamaMode.Generate)]
        public InArgument<OllamaMode> Mode { get; set; }

        [DisplayName("Chat Messages")]
        [Description("Optional: Chat messages when in Chat mode. Format each as role:content (e.g., 'user:hello').")]
        public InArgument<List<string>> ChatMessages { get; set; }

        [DisplayName("Headers")]
        [Description("Optional: Extra HTTP headers for the request.")]
        public InArgument<Dictionary<string, string>> Headers { get; set; }

        [DisplayName("Content Type")]
        [DefaultValue("application/json")]
        public InArgument<string> ContentType { get; set; }

        [DisplayName("Accept Header")]
        [DefaultValue("application/json")]
        public InArgument<string> AcceptHeader { get; set; }

        // -------------------------------
        // OUTPUT ARGUMENTS
        // -------------------------------

        [DisplayName("Ollama Result")]
        [Description("The final text response returned by Ollama.")]
        public OutArgument<string> OllamaResult { get; set; }

        [DisplayName("Response Code")]
        [Description("The HTTP status code returned by Ollama API.")]
        public OutArgument<int> ResponseCode { get; set; }

        // -------------------------------
        // EXECUTION
        // -------------------------------

        protected override IAsyncResult BeginExecute(AsyncCodeActivityContext context, AsyncCallback callback, object state)
        {
            var baseUrl = BaseUrl.Get(context) ?? "http://localhost:11434";
            var model = Model.Get(context);
            var prompt = Prompt.Get(context);
            var mode = Mode.Get(context);
            var chatMessages = ChatMessages.Get(context);
            var contentType = ContentType.Get(context) ?? "application/json";
            var acceptType = AcceptHeader.Get(context) ?? "application/json";
            var headers = Headers.Get(context);

            if (string.IsNullOrWhiteSpace(model))
                throw new ArgumentException("Model must be specified.");
            if (mode == OllamaMode.Generate && string.IsNullOrWhiteSpace(prompt))
                throw new ArgumentException("Prompt is required in Generate mode.");
            if (mode == OllamaMode.Chat && (chatMessages == null || chatMessages.Count == 0) && string.IsNullOrWhiteSpace(prompt))
                throw new ArgumentException("ChatMessages or Prompt must be provided in Chat mode.");

            // Pick endpoint
            string endpoint = mode == OllamaMode.Chat ? "/api/chat" : "/api/generate";
            string url = $"{baseUrl.TrimEnd('/')}{endpoint}";

            // Build request body
            string body;
            if (mode == OllamaMode.Generate)
            {
                var reqObj = new { model = model, prompt = prompt };
                body = Newtonsoft.Json.JsonConvert.SerializeObject(reqObj);
            }
            else
            {
                var msgs = new List<object>();
                if (chatMessages != null)
                {
                    foreach (var msg in chatMessages)
                    {
                        var parts = msg.Split(new[] { ':' }, 2);
                        if (parts.Length == 2)
                            msgs.Add(new { role = parts[0].Trim(), content = parts[1].Trim() });
                    }
                }
                if (!string.IsNullOrWhiteSpace(prompt))
                    msgs.Add(new { role = "user", content = prompt });

                var reqObj = new { model = model, messages = msgs };
                body = Newtonsoft.Json.JsonConvert.SerializeObject(reqObj);
            }

            var task = InvokeWebServiceAsync(url, body, contentType, acceptType, headers);

            var tcs = new TaskCompletionSource<HttpResponseMessage>(state);
            task.ContinueWith(t =>
            {
                if (t.IsFaulted) tcs.TrySetException(t.Exception.InnerExceptions);
                else if (t.IsCanceled) tcs.TrySetCanceled();
                else tcs.TrySetResult(t.Result);
                callback?.Invoke(tcs.Task);
            });

            return tcs.Task;
        }

        protected override async void EndExecute(AsyncCodeActivityContext context, IAsyncResult result)
        {
            var task = (Task<HttpResponseMessage>)result;
            string responseContent = "";
            int code = 0;
            bool success = false;

            try
            {
                var response = await task;
                code = (int)response.StatusCode;
                success = response.IsSuccessStatusCode;

                if (response.Content != null)
                    responseContent = await response.Content.ReadAsStringAsync();

                string finalOutput = "";

                // Ollama returns JSONL stream → parse line by line
                foreach (var line in responseContent.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    try
                    {
                        var obj = JObject.Parse(line);

                        // Generate mode response
                        if (obj["response"] != null)
                            finalOutput += obj["response"].ToString();

                        // Chat mode response
                        if (obj["message"]?["content"] != null)
                            finalOutput += obj["message"]["content"].ToString();
                    }
                    catch
                    {
                        // Ignore invalid lines
                    }
                }

                OllamaResult.Set(context, finalOutput.Trim());
                ResponseCode.Set(context, code);
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, success ? "Ollama request succeeded." : $"Ollama request failed ({code})");
            }
            catch (Exception ex)
            {
                OllamaResult.Set(context, "");
                ResponseCode.Set(context, -1);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            }
        }

        private static async Task<HttpResponseMessage> InvokeWebServiceAsync(string url, string body, string contentType, string acceptType, Dictionary<string, string> headers)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));

                if (headers != null)
                {
                    foreach (var h in headers)
                        client.DefaultRequestHeaders.TryAddWithoutValidation(h.Key, h.Value);
                }

                var postContent = new StringContent(body ?? "", Encoding.UTF8, contentType);
                return await client.PostAsync(url, postContent);
            }
        }

        public enum OllamaMode
        {
            [Display(Name = "Generate", Description = "Single prompt → response via /api/generate")]
            Generate,
            [Display(Name = "Chat", Description = "Conversation via /api/chat with role-based messages")]
            Chat
        }
    }
}
