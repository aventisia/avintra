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
    [DisplayName("Update a lead")]
    [Description("Updates an existing lead in Salesforce.")]
    public class UpdateLeadActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Lead ID")]
        [Description("The ID of the lead to update")]
        public InArgument<string> LeadId { get; set; }

        [DisplayName("Fields to Update")]
        [Description("JSON object containing fields to update")]
        public InArgument<string> FieldsToUpdateJson { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var leadId = LeadId.Get(context);
                var fieldsJson = FieldsToUpdateJson.Get(context);

                if (string.IsNullOrWhiteSpace(leadId))
                    throw new ArgumentException("Lead ID is required.");
                if (string.IsNullOrWhiteSpace(fieldsJson))
                    throw new ArgumentException("Fields to update are required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                using (var httpClient = new HttpClient())
                {
                    // Set authorization and accept headers
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Build the PATCH request
                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Lead/{leadId}";

                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = new StringContent(fieldsJson, System.Text.Encoding.UTF8, "application/json")
                    };

                    // Send the PATCH request
                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Lead '{leadId}' updated successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update lead. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating lead: {ex.Message}");
            }
        }
    }
}