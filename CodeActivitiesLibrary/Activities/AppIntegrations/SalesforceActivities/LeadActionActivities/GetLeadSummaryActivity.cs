using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Get a lead summary")]
    [Description("Retrieves a summary of a lead's information from Salesforce.")]
    public class GetLeadSummaryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Lead ID")]
        [Description("The ID of the lead to retrieve the summary for")]
        public InArgument<string> LeadId { get; set; }

        [DisplayName("Lead Summary")]
        [Description("The retrieved lead summary as a JSON string.")]
        public OutArgument<string> LeadSummary { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var leadId = LeadId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(leadId))
                    throw new ArgumentException("Lead ID is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing in credential.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0"; // Default API version

                // Build API URL
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Lead/{leadId}";

                using (var httpClient = new HttpClient())
                {
                    // Set headers
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Make GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        // Optionally extract only key fields for "summary"
                        var leadData = JsonConvert.DeserializeObject<Newtonsoft.Json.Linq.JObject>(responseContent);
                        var summary = new
                        {
                            Id = leadData["Id"]?.ToString(),
                            FirstName = leadData["FirstName"]?.ToString(),
                            LastName = leadData["LastName"]?.ToString(),
                            Company = leadData["Company"]?.ToString(),
                            Status = leadData["Status"]?.ToString(),
                            Email = leadData["Email"]?.ToString(),
                            Phone = leadData["Phone"]?.ToString(),
                            CreatedDate = leadData["CreatedDate"]?.ToString(),
                            LastModifiedDate = leadData["LastModifiedDate"]?.ToString()
                        };

                        string summaryJson = JsonConvert.SerializeObject(summary, Formatting.Indented);

                        LeadSummary.Set(context, summaryJson);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Lead summary for '{leadId}' retrieved successfully.");
                    }
                    else
                    {
                        LeadSummary.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve lead summary. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                LeadSummary.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving lead summary: {ex.Message}");
            }
        }
    }
}