using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
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
    [DisplayName("Add Contact to Campaign")]
    [Description("Adds a Contact to a Salesforce Campaign by creating a CampaignMember record.")]
    public sealed class AddContactToCampaignActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Contact ID")]
        [Description("The Salesforce ID of the Contact to add to the campaign (required).")]
        public InArgument<string> ContactId { get; set; }

        [RequiredArgument]
        [DisplayName("Campaign ID")]
        [Description("The Salesforce ID of the Campaign to add the Contact to (required).")]
        public InArgument<string> CampaignId { get; set; }

        [DisplayName("Status")]
        [Description("The status of the CampaignMember (e.g., 'Sent', 'Responded'). Default is 'Sent'.")]
        public InArgument<string> Status { get; set; } = new InArgument<string>("Sent");

        [DisplayName("Created CampaignMember ID")]
        [Description("The Salesforce ID of the newly created CampaignMember record.")]
        public OutArgument<string> CampaignMemberId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after adding the contact to the campaign.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var contactId = ContactId.Get(context);
                var campaignId = CampaignId.Get(context);
                var status = Status.Get(context);

                if (string.IsNullOrWhiteSpace(contactId))
                    throw new ArgumentException("Contact ID is required.");

                if (string.IsNullOrWhiteSpace(campaignId))
                    throw new ArgumentException("Campaign ID is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build request body
                var requestBody = new Dictionary<string, object>
                {
                    { "ContactId", contactId },
                    { "CampaignId", campaignId },
                    { "Status", status }
                };

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/CampaignMember/";

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(responseContent);
                        string id = result?.id?.ToString();

                        CampaignMemberId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Contact added to campaign successfully with CampaignMember ID: {id}");
                    }
                    else
                    {
                        CampaignMemberId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to add contact to campaign. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                CampaignMemberId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error adding contact to campaign: {ex.Message}");
            }
        }
    }
}