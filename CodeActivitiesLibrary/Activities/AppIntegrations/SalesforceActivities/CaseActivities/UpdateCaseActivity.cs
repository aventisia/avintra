using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Update Salesforce Case")]
    [Description("Updates an existing Case record in Salesforce using the provided credentials and updated field values.")]
    public sealed class UpdateCaseActivity : BaseCodeActivity
    {
        // Input: Credential to connect with
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        // Input: Resource (must be 'Case')
        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Case'.")]
        public InArgument<string> Resource { get; set; }

        // Input: Operation (must be 'Update')
        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform on the resource. Must be 'Update'.")]
        public InArgument<string> Operation { get; set; }

        // Input: Case ID (required)
        [RequiredArgument]
        [DisplayName("Case ID")]
        [Description("The Salesforce Case ID (15 or 18 characters) of the record to update.")]
        public InArgument<string> CaseId { get; set; }

        // Input: Subject (optional update)
        [DisplayName("Subject")]
        [Description("The updated subject of the Case (optional).")]
        public InArgument<string> Subject { get; set; }

        // Output: Success Status
        [DisplayName("Success")]
        [Description("Indicates whether the Case was updated successfully.")]
        public OutArgument<bool> Success { get; set; }

        // Output: Response from Salesforce
        [DisplayName("Response")]
        [Description("The raw response from Salesforce after the update operation.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string caseId = CaseId.Get(context);
                string subject = Subject.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(caseId))
                    throw new ArgumentException("Case ID is required.");

                if (!string.Equals(resource?.Trim(), "Case", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Case'.");

                if (!string.Equals(operation?.Trim(), "Update", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Update'.");

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
                var requestBody = new Dictionary<string, object>();

                if (!string.IsNullOrWhiteSpace(subject))
                    requestBody["Subject"] = subject;

                if (requestBody.Count == 0)
                    throw new ArgumentException("No fields provided to update.");

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                // Prepare HTTP request
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // PATCH endpoint: /services/data/vXX.X/sobjects/Case/{id}
                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/{caseId}";
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");


                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = content
                    };
                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    // Use PATCH method via HttpClient

                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Success.Set(context, true);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Case '{caseId}' updated successfully.");
                    }
                    else
                    {
                        Success.Set(context, false);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Failed to update Case. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Success.Set(context, false);
                Response.Set(context, null);
                StatusMessage.Set(context, $"Error updating Case: {ex.Message}");
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