using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.HTTPActivities
{

    // Activity to invoke a web service and store the response text
    [DisplayName("Invoke Web Service"), Description("Invokes a web service and stores the response text.")]
    public class InvokeWebServiceActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The URL of the web service endpoint.")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument, Category("Input"), Description("The HTTP method (e.g., GET, POST).")]
        public InArgument<string> HttpMethod { get; set; }

        [Category("Output"), Description("Returns the response text from the web service.")]
        public OutArgument<string> Result { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var endpointUrl = EndpointUrl.Get(context);
            var httpMethod = HttpMethod.Get(context);
            var result = "";
            var status = "";

            try
            {
                using (var client = new HttpClient())
                {
                    HttpResponseMessage response = null;

                    switch (httpMethod.ToUpperInvariant())
                    {
                        case "GET":
                            response = client.GetAsync(endpointUrl).Result;
                            break;
                        case "POST":
                            response = client.PostAsync(endpointUrl, null).Result;
                            break;
                        default:
                            throw new ArgumentException($"Unsupported HTTP method: {httpMethod}");
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        result = response.Content.ReadAsStringAsync().Result;
                        status = "Web service invoked successfully.";
                    }
                    else
                    {
                        result = "";
                        status = $"Failed to invoke web service: HTTP Status Code - {response.StatusCode}";
                    }
                }
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error invoking web service: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}