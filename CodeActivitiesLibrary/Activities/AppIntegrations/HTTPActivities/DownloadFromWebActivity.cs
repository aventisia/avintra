using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.HttpActivities
{
    [DisplayName("Download from Web")]
    [Description("Downloads text or a file from the web and stores it in memory or saves it to a file.")]
    public class DownloadFromWebActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("URL")]
        [Description("The URL of the resource to download (e.g., text, HTML, JSON, PDF).")]
        public InArgument<string> Url { get; set; }


        [DisplayName("Save To File")]
        [Description("If true, downloads and saves the content to a local file instead of returning as string.")]
        public InArgument<bool> SaveToFile { get; set; }


        [DisplayName("File Path")]
        [Description("Full path where the downloaded file should be saved. Required if 'Save To File' is true.")]
        [RenderIfCondition(nameof(SaveToFile), true)]
        public InArgument<string> FilePath { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Result")]
        [Description("Returns the downloaded content as string or file path depending on mode.")]
        public OutArgument<string> Result { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var result = "";

            try
            {
                var url = Url.Get(context);
                var saveToFile = SaveToFile.Get(context);
                var filePath = FilePath.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (string.IsNullOrWhiteSpace(url))
                    throw new ArgumentException("URL must be specified.");

                if (saveToFile && string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path must be specified when saving to file.");

                using (var client = new HttpClient())
                {
                    client.Timeout = timeout;

                    var responseTask = client.GetAsync(url);
                    responseTask.Wait();

                    var response = responseTask.Result;

                    if (response.IsSuccessStatusCode)
                    {
                        if (saveToFile)
                        {
                            var contentTask = response.Content.ReadAsByteArrayAsync();
                            contentTask.Wait();

                            File.WriteAllBytes(filePath, contentTask.Result);
                            result = filePath;
                            status = $"File successfully saved to '{filePath}'.";
                        }
                        else
                        {
                            var contentTask = response.Content.ReadAsStringAsync();
                            contentTask.Wait();

                            result = contentTask.Result;
                            status = "Text content downloaded successfully.";
                        }
                    }
                    else
                    {
                        status =
                            $"Failed to download content: HTTP {(int)response.StatusCode} - {response.ReasonPhrase}";
                        result = "";
                    }
                }
                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error downloading from web: {ex.Message}";
                Result.Set(context, result);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}