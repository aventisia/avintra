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
    [DisplayName("Get Salesforce Attachment Summary")]
    [Description("Retrieves summary information about attachments linked to a parent record, such as the total count.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class GetAttachmentSummaryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Parent ID")]
        [Description("The Salesforce ID of the parent record (e.g., Account, Contact) to summarize attachments for.")]
        public InArgument<string> ParentId { get; set; }

        [DisplayName("Summary Data")]
        [Description("The summary data as a JSON string (e.g., count of attachments).")]
        public OutArgument<string> SummaryData { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var parentId = ParentId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(parentId))
                    throw new ArgumentException("Parent ID is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build SOQL query to count attachments
                string soqlQuery = $"SELECT COUNT() FROM Attachment WHERE ParentId = '{parentId}'";
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={Uri.EscapeDataString(soqlQuery)}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        SummaryData.Set(context, responseContent);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Attachment summary retrieved successfully.");
                    }
                    else
                    {
                        SummaryData.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve attachment summary. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                SummaryData.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving attachment summary: {ex.Message}");
            }
        }
    }
}
