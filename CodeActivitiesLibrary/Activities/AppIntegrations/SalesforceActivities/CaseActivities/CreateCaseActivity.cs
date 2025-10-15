using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Create Salesforce Case")]
    [Description("Creates a new Case record in Salesforce using the provided credentials and case details.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class CreateCaseActivity : BaseCodeActivity
    {

        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }


        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Case'.")]
        public InArgument<string> Resource { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform on the resource. Must be 'Create'.")]
        public InArgument<string> Operation { get; set; }


        [RequiredArgument]
        [DisplayName("Subject")]
        [Description("The subject of the Case (required).")]
        public InArgument<string> Subject { get; set; }


        [DisplayName("Created Case ID")]
        [Description("The Salesforce ID of the newly created Case record.")]
        public OutArgument<string> CaseId { get; set; }


        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after creating the Case.")]
        public OutArgument<string> Response { get; set; }

        // Output: Success Status
        [DisplayName("Success")]
        [Description("Indicates whether the Case was created successfully.")]
        public OutArgument<bool> Success { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string subject = Subject.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(subject))
                    throw new ArgumentException("Subject is required.");

                if (!string.Equals(resource?.Trim(), "Case", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Case'.");

                if (!string.Equals(operation?.Trim(), "Create", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Create'.");

                // Deserialize credential
                var credentials = JsonConvert.DeserializeObject<SalesforceCredential>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0"; // Default API version

                // Build request body
                var requestBody = new Dictionary<string, object>
                {
                    { "Subject", subject }
                };

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                // Prepare HTTP request
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/";
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                    // Correct way: Use GetAwaiter().GetResult() to synchronously wait
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(responseContent);
                        string caseId = result?.id?.ToString();

                        CaseId.Set(context, caseId);
                        Response.Set(context, responseContent);
                        Success.Set(context, true);
                        StatusMessage.Set(context, $"Case created successfully with ID: {caseId}");
                    }
                    else
                    {
                        CaseId.Set(context, null);
                        Response.Set(context, responseContent);
                        Success.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create Case. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                CaseId.Set(context, null);
                Response.Set(context, null);
                Success.Set(context, false);
                StatusMessage.Set(context, $"Error creating Case: {ex.Message}");
            }
        }

        // Helper class for credential deserialization
        private class SalesforceCredential
        {
            public string InstanceUrl { get; set; }
            public string AccessToken { get; set; }
            public string ApiVersion { get; set; }
        }
    }
}