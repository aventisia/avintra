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
    [DisplayName("Create or update a custom object")]
    [Description("Creates a new custom object or updates an existing one in Salesforce using an external ID field.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public class CreateOrUpdateCustomObjectActivity : BaseCodeActivity
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
        [DisplayName("External ID Field")]
        [Description("The API name of the custom external ID field (e.g., 'External_Id__c').")]
        public InArgument<string> ExternalIdField { get; set; }

        [RequiredArgument]
        [DisplayName("External ID Value")]
        [Description("The value of the external ID to upsert on.")]
        public InArgument<string> ExternalIdValue { get; set; }

        [RequiredArgument]
        [DisplayName("Fields")]
        [Description("The field-value pairs to set on the custom object.")]
        public InArgument<Dictionary<string, object>> Fields { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional properties to include in the request.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Record ID")]
        [Description("The ID of the created or updated record.")]
        public OutArgument<string> RecordId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var sObjectName = CustomObjectNameOrId.Get(context);
                var externalIdField = ExternalIdField.Get(context);
                var externalIdValue = ExternalIdValue.Get(context);
                var fields = Fields.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(sObjectName))
                    throw new ArgumentException("Custom Object API Name is required.");
                if (string.IsNullOrWhiteSpace(externalIdField))
                    throw new ArgumentException("External ID Field is required.");
                if (string.IsNullOrWhiteSpace(externalIdValue))
                    throw new ArgumentException("External ID Value is required.");
                if (fields == null || fields.Count == 0)
                    throw new ArgumentException("At least one field must be provided.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Merge Fields and AdditionalFields
                var recordData = new Dictionary<string, object>(fields, StringComparer.OrdinalIgnoreCase);
                if (additionalFields != null)
                {
                    foreach (var kv in additionalFields)
                    {
                        recordData[kv.Key] = kv.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(recordData);

                // Build upsert endpoint: /sobjects/Invoice__c/External_Id__c/123
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{sObjectName}/{externalIdField}/{Uri.EscapeDataString(externalIdValue)}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Use PATCH request via SendAsync (no PatchAsync in .NET Framework)
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json")
                    };

                    var response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.NoContent)
                    {
                        // On upsert, Salesforce returns 204 NoContent on success
                        // But we can try to extract ID from URI or response
                        string recordId = null;
                        try
                        {
                            var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                            if (result.ContainsKey("id"))
                                recordId = result["id"].ToString();
                        }
                        catch { /* ignore */ }

                        RecordId.Set(context, recordId);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Custom object '{sObjectName}' with {externalIdField} = {externalIdValue} created or updated successfully.");
                    }
                    else
                    {
                        RecordId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to upsert custom object. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                RecordId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating or updating custom object: {ex.Message}");
            }
        }
    }
}