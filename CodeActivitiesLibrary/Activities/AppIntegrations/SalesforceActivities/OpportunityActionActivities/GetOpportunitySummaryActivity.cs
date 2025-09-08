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
    [DisplayName("Get Opportunity Summary")]
    [Description("Retrieves a summary of a Salesforce opportunity by its ID.")]
    public class GetOpportunitySummaryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Opportunity ID")]
        [Description("The ID of the opportunity to retrieve the summary for.")]
        public InArgument<string> OpportunityId { get; set; }

        [DisplayName("Opportunity Summary")]
        [Description("The retrieved opportunity summary as a JSON string.")]
        public OutArgument<string> OpportunitySummary { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var opportunityId = OpportunityId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(opportunityId))
                    throw new ArgumentException("Opportunity ID is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build endpoint: /sobjects/Opportunity/0067Q00000123xyz
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Opportunity/{opportunityId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        // Parse response
                        var opportunityData = JsonConvert.DeserializeObject<Newtonsoft.Json.Linq.JObject>(responseContent);

                        // Extract key fields for summary
                        var summary = new
                        {
                            Id = opportunityData["Id"]?.ToString(),
                            Name = opportunityData["Name"]?.ToString(),
                            StageName = opportunityData["StageName"]?.ToString(),
                            Amount = opportunityData["Amount"]?.ToString(),
                            CloseDate = opportunityData["CloseDate"]?.ToString(),
                            AccountId = opportunityData["AccountId"]?.ToString(),
                            CreatedDate = opportunityData["CreatedDate"]?.ToString(),
                            LastModifiedDate = opportunityData["LastModifiedDate"]?.ToString()
                        };

                        string summaryJson = JsonConvert.SerializeObject(summary, Formatting.Indented);

                        OpportunitySummary.Set(context, summaryJson);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Opportunity '{opportunityId}' summary retrieved successfully.");
                    }
                    else
                    {
                        OpportunitySummary.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve opportunity summary. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                OpportunitySummary.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving opportunity summary: {ex.Message}");
            }
        }
    }
}