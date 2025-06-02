using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.HTTPActivities
{

    // Activity to download text or a file from the web
    [DisplayName("Download from Web"), Description("Downloads text or a file from the web and stores it.")]
    public class DownloadFromWebActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The URL of the resource to download.")]
        public InArgument<string> Url { get; set; }

        [Category("Output"), Description("Returns the downloaded content as a string.")]
        public OutArgument<string> Result { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var url = Url.Get(context);
            var result = "";
            var status = "";

            try
            {
                using (var client = new HttpClient())
                {
                    var response = client.GetAsync(url).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        result = response.Content.ReadAsStringAsync().Result;
                        status = "Content downloaded successfully.";
                    }
                    else
                    {
                        result = "";
                        status = $"Failed to download content: HTTP Status Code - {response.StatusCode}";
                    }
                }
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error downloading content: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}