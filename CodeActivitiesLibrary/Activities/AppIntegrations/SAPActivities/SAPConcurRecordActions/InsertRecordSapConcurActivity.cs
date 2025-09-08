using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Insert Record to SAP Concur")]
    [Description("Inserts a new expense or quick expense record into SAP Concur using OAuth 2.0.")]
    public class InsertRecordSapConcurActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

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
        [Description("The scope required (e.g., quickexpense.write).")]
        public InArgument<string> Scope { get; set; }

        [DisplayName("API Endpoint")]
        [Description("The SAP Concur API endpoint (e.g., /quickexpense/v4/quickexpenses).")]
        public InArgument<string> ApiEndpoint { get; set; } = "/quickexpense/v4/quickexpenses";

        [RequiredArgument]
        [DisplayName("JSON Payload")]
        [Description("The JSON body of the record to insert.")]
        public InArgument<string> JsonPayload { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Response")]
        [Description("The response from SAP Concur API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API.")]
        public OutArgument<int> StatusCode { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var apiEndpoint = ApiEndpoint.Get(context);
                var jsonPayload = JsonPayload.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");

                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");

                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");

                if (string.IsNullOrWhiteSpace(apiEndpoint))
                    throw new ArgumentException("API Endpoint is required.");

                if (string.IsNullOrWhiteSpace(jsonPayload))
                    throw new ArgumentException("JSON Payload is required.");

                // Step 1: Get OAuth Access Token

                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                // Step 2: Insert Record
                var (response, statusCode) = InsertRecord(token, apiEndpoint, jsonPayload);

                // Set outputs
                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode >= 200 && statusCode < 300);
                StatusMessage.Set(context, statusCode == 201 ?
                    "Record inserted successfully." :
                    $"SAP Concur API returned status {statusCode}.");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error inserting record to SAP Concur: {ex.Message}";
                Response.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

       
        // ----------------------
        // Helper: Insert Record
        // ----------------------

        private (string response, int statusCode) InsertRecord(string token, string apiEndpoint, string jsonPayload)
        {
            var apiUrl = $"https://us.api.concursolutions.com{apiEndpoint}";

             var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("Content-Type", "application/json");

            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            var response = client.PostAsync(apiUrl, content).Result;

            var responseText = response.Content.ReadAsStringAsync().Result;
            return (responseText, (int)response.StatusCode);
        }
    }
}