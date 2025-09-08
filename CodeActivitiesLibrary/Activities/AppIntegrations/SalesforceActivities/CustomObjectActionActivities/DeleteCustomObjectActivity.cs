using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Delete a custom object")]
    [Description("Deletes a custom object in Salesforce by its ID.")]
    public class DeleteCustomObjectActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Custom Object API Name")]
        [Description("The API name of the custom object (e.g., 'Invoice__c').")]
        public InArgument<string> CustomObjectNameOrId { get; set; }

        [RequiredArgument]
        [DisplayName("Record ID")]
        [Description("The ID of the custom object record to delete.")]
        public InArgument<string> RecordId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce after deletion.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var sObjectName = CustomObjectNameOrId.Get(context);
                var recordId = RecordId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(sObjectName))
                    throw new ArgumentException("Custom Object API Name is required.");
                if (string.IsNullOrWhiteSpace(recordId))
                    throw new ArgumentException("Record ID is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build DELETE endpoint
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{sObjectName}/{recordId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", credentials.AccessToken);

                    // Send DELETE request
                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Custom object '{recordId}' deleted successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to delete custom object. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting custom object: {ex.Message}");
            }
        }
    }
}