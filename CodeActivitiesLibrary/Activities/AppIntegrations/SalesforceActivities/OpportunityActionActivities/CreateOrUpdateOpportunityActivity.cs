using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Create or Update Opportunity")]
    [Description("Creates a new opportunity or updates an existing one using an external ID field.")]
    public class CreateOrUpdateOpportunityActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Match Against")]
        [Description("The custom external ID field to match against (e.g., 'External_ID__c').")]
        public InArgument<string> MatchAgainst { get; set; }

        [RequiredArgument]
        [DisplayName("Value to Match")]
        [Description("The value of the external ID to upsert on.")]
        public InArgument<string> ValueToMatch { get; set; }

        [RequiredArgument]
        [DisplayName("Name")]
        [Description("The name of the opportunity (required).")]
        public InArgument<string> Name { get; set; }

        [RequiredArgument]
        [DisplayName("Close Date")]
        [Description("The close date of the opportunity (required).")]
        public InArgument<DateTime> CloseDate { get; set; }

        [RequiredArgument]
        [DisplayName("Stage Name or ID")]
        [Description("The stage of the opportunity (e.g., 'Prospecting', 'Closed Won').")]
        public InArgument<string> StageNameOrId { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional field-value pairs to set on the opportunity (e.g., AccountId, Amount).")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Opportunity ID")]
        [Description("The ID of the created or updated opportunity.")]
        public OutArgument<string> OpportunityId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var matchAgainst = MatchAgainst.Get(context);
                var valueToMatch = ValueToMatch.Get(context);
                var name = Name.Get(context);
                var closeDate = CloseDate.Get(context);
                var stageName = StageNameOrId.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(matchAgainst))
                    throw new ArgumentException("Match Against is required.");
                if (string.IsNullOrWhiteSpace(valueToMatch))
                    throw new ArgumentException("Value to Match is required.");
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name is required.");
                if (closeDate == null)
                    throw new ArgumentException("Close Date is required.");
                if (string.IsNullOrWhiteSpace(stageName))
                    throw new ArgumentException("Stage Name or ID is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build opportunity data
                var opportunityData = new Dictionary<string, object>
                {
                    { "Name", name },
                    { "CloseDate", closeDate.ToString("yyyy-MM-dd") }, // ISO 8601 format
                    { "StageName", stageName }
                };

                // Add additional fields
                if (additionalFields != null)
                {
                    foreach (var kv in additionalFields)
                    {
                        opportunityData[kv.Key] = kv.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(opportunityData);

                // Build endpoint: /sobjects/Opportunity/External_ID__c/12345
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Opportunity/{matchAgainst}/{Uri.EscapeDataString(valueToMatch)}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Use SendAsync with PATCH method
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json")
                    };

                    var response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.NoContent)
                    {
                        // Extract ID from response
                        string id = null;
                        try
                        {
                            var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                            if (result.ContainsKey("id"))
                                id = result["id"].ToString();
                        }
                        catch { /* ignore */ }

                        OpportunityId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Opportunity with {matchAgainst} = {valueToMatch} created or updated successfully.");
                    }
                    else
                    {
                        OpportunityId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to upsert opportunity. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                OpportunityId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating or updating opportunity: {ex.Message}");
            }
        }
    }
}