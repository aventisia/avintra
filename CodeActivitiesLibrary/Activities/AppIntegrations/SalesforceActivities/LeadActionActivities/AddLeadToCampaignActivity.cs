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
    [DisplayName("Add a lead to a campaign")]
    [Description("Adds an existing lead to a Salesforce campaign.")]
    public class AddLeadToCampaignActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Lead ID")]
        [Description("The ID of the lead to add to the campaign")]
        public InArgument<string> LeadId { get; set; }

        [RequiredArgument]
        [DisplayName("Campaign Name or ID")]
        [Description("The name or ID of the campaign to add the lead to")]
        public InArgument<string> CampaignNameOrId { get; set; }

        [DisplayName("Options")]
        [Description("Additional properties to include in the request")]
        public InArgument<Dictionary<string, object>> Options { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var leadId = LeadId.Get(context);
                var campaign = CampaignNameOrId.Get(context);

                if (string.IsNullOrWhiteSpace(leadId))
                    throw new ArgumentException("Lead ID is required.");
                if (string.IsNullOrWhiteSpace(campaign))
                    throw new ArgumentException("Campaign Name or ID is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Create relationship: Lead to CampaignMember
                var data = new Dictionary<string, object>
                {
                    { "LeadId", leadId },
                    { "CampaignId", campaign }
                };

                string jsonBody = JsonConvert.SerializeObject(data);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/CampaignMember/";

                    var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Lead '{leadId}' added to campaign '{campaign}'.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to add lead to campaign. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error adding lead to campaign: {ex.Message}");
            }
        }
    }
}