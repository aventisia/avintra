using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Update a custom object")]
    [Description("Updates an existing custom object in Salesforce with new field values.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public class UpdateCustomObjectActivity : BaseCodeActivity
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
        [Description("The ID of the custom object record to update.")]
        public InArgument<string> RecordId { get; set; }

        [RequiredArgument]
        [DisplayName("Fields")]
        [Description("The field-value pairs to update on the custom object.")]
        public InArgument<Dictionary<string, object>> Fields { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional properties to include in the request.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var sObjectName = CustomObjectNameOrId.Get(context);
                var recordId = RecordId.Get(context);
                var fields = Fields.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(sObjectName))
                    throw new ArgumentException("Custom Object API Name is required.");
                if (string.IsNullOrWhiteSpace(recordId))
                    throw new ArgumentException("Record ID is required.");
                if (fields == null || fields.Count == 0)
                    throw new ArgumentException("At least one field must be provided for update.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Merge Fields and AdditionalFields
                var updateData = new Dictionary<string, object>(fields, StringComparer.OrdinalIgnoreCase);
                if (additionalFields != null)
                {
                    foreach (var kv in additionalFields)
                    {
                        updateData[kv.Key] = kv.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(updateData);

                // Build PATCH endpoint: /sobjects/Invoice__c/a007Q00000123xyz
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{sObjectName}/{recordId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                    // Use SendAsync with PATCH method
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json")
                    };

                    var response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Custom object '{recordId}' updated successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update custom object. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating custom object: {ex.Message}");
            }
        }
    }
}