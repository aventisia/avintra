using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Wait for an Event on SAP Concur and Resume")]
    [Description("Pauses and resumes a workflow based on specific events occurring in SAP Concur.")]
    public class WaitForEventOnSapConcurActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP Concur App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP Concur App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., expense.report.read).")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("Polling Endpoint")]
        [Description("Endpoint to poll for event (e.g., /expense/v4.0/reports/{id}).")]
        public InArgument<string> PollingEndpoint { get; set; }

        [RequiredArgument]
        [DisplayName("Expected Status")]
        [Description("Status to wait for (e.g., APPROVED, SUBMITTED).")]
        public InArgument<string> ExpectedStatus { get; set; }

        [DisplayName("Polling Interval (seconds)")]
        [Description("How often to check for the event (default: 10 seconds).")]
        public InArgument<int> PollingInterval { get; set; } = 10;

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait before timing out (default: 300 seconds).")]
        public InArgument<int> MaxWaitTime { get; set; } = 300;

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Event Response")]
        [Description("The final response when event is detected.")]
        public OutArgument<string> EventResponse { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code when event is detected.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var pollingEndpoint = PollingEndpoint.Get(context);
                var expectedStatus = ExpectedStatus.Get(context);
                var interval = PollingInterval.Get(context);
                var maxWait = MaxWaitTime.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (string.IsNullOrWhiteSpace(pollingEndpoint))
                    throw new ArgumentException("Polling Endpoint is required.");
                if (string.IsNullOrWhiteSpace(expectedStatus))
                    throw new ArgumentException("Expected Status is required.");

                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                var apiUrl = $"https://us.api.concursolutions.com{pollingEndpoint}";

                var startTime = DateTime.Now;
                var elapsed = 0;

                while (elapsed < maxWait)
                {
                    var (response, statusCode) = GetRequest(token, apiUrl);

                    if (statusCode == 200)
                    {
                        dynamic data = JsonConvert.DeserializeObject(response);
                        var currentStatus = data.status?.ToString();

                        if (currentStatus?.Equals(expectedStatus, StringComparison.OrdinalIgnoreCase) == true)
                        {
                            EventResponse.Set(context, response);
                            StatusCode.Set(context, statusCode);
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, $"Event '{expectedStatus}' detected.");
                            return;
                        }
                    }

                    Thread.Sleep(interval * 1000);
                    elapsed = (int)(DateTime.Now - startTime).TotalSeconds;
                }

                // Timeout
                EventResponse.Set(context, "Timeout: Event not found within max wait time.");
                StatusCode.Set(context, 408);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Wait timed out.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error waiting for event: {ex.Message}";
                EventResponse.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private (string response, int statusCode) GetRequest(string token, string url)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var response = client.GetAsync(url).Result;
            var responseText = response.Content.ReadAsStringAsync().Result;
            return (responseText, (int)response.StatusCode);
        }
    }
}