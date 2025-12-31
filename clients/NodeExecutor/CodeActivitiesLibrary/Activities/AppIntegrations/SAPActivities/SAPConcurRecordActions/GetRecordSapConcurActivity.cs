using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Get Record in SAP Concur")]
    [Description("Retrieves a single record by ID from SAP Concur.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class GetRecordSapConcurActivity : BaseCodeActivity
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
        [DisplayName("API Endpoint")]
        [Description("The full API endpoint including record ID (e.g., /expense/v4.0/reports/12345).")]
        public InArgument<string> ApiEndpoint { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Response")]
        [Description("The record data in JSON format.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var apiEndpoint = ApiEndpoint.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");

                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");

                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");

                if (string.IsNullOrWhiteSpace(apiEndpoint))
                    throw new ArgumentException("API Endpoint is required.");

                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                var fullUrl = $"https://us.api.concursolutions.com{apiEndpoint}";
                var (response, statusCode) = GetRequest(token, fullUrl);

                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode == 200);
                StatusMessage.Set(context, statusCode == 200
                    ? "Record retrieved successfully."
                    : $"API returned status {statusCode}.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error retrieving record from SAP Concur: {ex.Message}";
                Response.Set(context, errorMsg);
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