using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Wait for an Event on SAP Cloud for Customer and Resume")]
    [Description("Pauses and resumes a workflow based on specific events occurring in SAP Cloud for Customer.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class WaitForEventOnSAPCloudForCustomerActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP C4C App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP C4C App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., 'com.sap.cloud.c4c.api').")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("Subdomain")]
        [Description("Your SAP C4C subdomain (e.g., 'mycompany' in mycompany.crm.ondemand.com).")]
        public InArgument<string> Subdomain { get; set; }

        [RequiredArgument]
        [DisplayName("API Endpoint")]
        [Description("The full endpoint path to poll (e.g., /salesorder/v1/salesorders('SO0000000001')")]
        public InArgument<string> ApiEndpoint { get; set; }

        [RequiredArgument]
        [DisplayName("Polling Interval (seconds)")]
        [Description("How often to check the status (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> PollingInterval { get; set; }

        [RequiredArgument]
        [DisplayName("Wait Condition")]
        [Description("The condition to wait for (e.g., 'Status eq \"Processed\"').")]
        public InArgument<string> WaitCondition { get; set; }

        [DisplayName("Timeout (seconds)")]
        [Description("Maximum time to wait before failing (0 = no timeout).")]
        [DefaultValue(300)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Response")]
        [Description("Final response body when condition is met.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API when condition is met.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var subdomain = Subdomain.Get(context);
                var apiEndpoint = ApiEndpoint.Get(context);
                var pollingInterval = PollingInterval.Get(context);
                var waitCondition = WaitCondition.Get(context);
                var timeout = Timeout.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("Subdomain is required.");
                if (string.IsNullOrWhiteSpace(apiEndpoint))
                    throw new ArgumentException("API Endpoint is required.");
                if (string.IsNullOrWhiteSpace(waitCondition))
                    throw new ArgumentException("Wait Condition is required.");

                // Build base URL
                var baseUrl = $"https://{subdomain}.crm.ondemand.com";
                var apiUrl = $"{baseUrl}{apiEndpoint}";

                // Step 1: Get OAuth Access Token
                var tokenHelper = new GetAccessTokenCloudForCustomersHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                // Step 2: Poll until condition is met
                var startTime = DateTime.Now;
                var elapsedSeconds = 0;
                bool conditionMet = false;

                while (!conditionMet && (timeout == 0 || elapsedSeconds < timeout))
                {
                    try
                    {
                        var (response, statusCode) = SendRequest(token, apiUrl);
                        var json = response;

                        // Evaluate condition (simple string match for now)
                        if (json.Contains(waitCondition))
                        {
                            conditionMet = true;
                            Response.Set(context, response);
                            StatusCode.Set(context, statusCode);
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Event condition met. Workflow resumed.");
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        StatusMessage.Set(context, $"Polling failed: {ex.Message}");
                        if (!continueOnError)
                            throw;
                    }

                    // Wait before next poll
                    System.Threading.Thread.Sleep(pollingInterval * 1000);
                    elapsedSeconds += pollingInterval;
                }

                if (!conditionMet)
                {
                    var errorMsg = $"Timeout reached after {elapsedSeconds} seconds. Condition not met.";
                    Response.Set(context, "");
                    StatusCode.Set(context, 408); // Request Timeout
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, errorMsg);

                    if (!continueOnError)
                        throw new InvalidOperationException(errorMsg);
                }
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error waiting for event: {ex.Message}";
                Response.Set(context, "");
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

       
        // ----------------------
        // Helper: Send Request
        // ----------------------

        private (string response, int statusCode) SendRequest(string token, string url)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
                client.DefaultRequestHeaders.Add("Accept", "application/json");

                var response = client.GetAsync(url).Result;
                var responseText = response.Content.ReadAsStringAsync().Result;
                return (responseText, (int)response.StatusCode);
            }
        }
    }
}