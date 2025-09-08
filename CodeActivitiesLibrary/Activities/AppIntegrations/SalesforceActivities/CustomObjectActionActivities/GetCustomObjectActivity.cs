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
    [DisplayName("Get a custom object")]
    [Description("Retrieves a single custom object from Salesforce by its ID.")]
    public class GetCustomObjectActivity : BaseCodeActivity
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
        [Description("The ID of the custom object record to retrieve.")]
        public InArgument<string> RecordId { get; set; }

        [DisplayName("Fields")]
        [Description("Optional comma-separated list of fields to retrieve (e.g., 'Name,Status__c,Amount__c'). If empty, retrieves all available fields.")]
        public InArgument<string> Fields { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Result")]
        [Description("The retrieved custom object data as a dictionary.")]
        public OutArgument<Dictionary<string, object>> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var sObjectName = CustomObjectNameOrId.Get(context);
                var recordId = RecordId.Get(context);
                var fields = Fields.Get(context); // Optional: specific fields

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

                // Build GET endpoint: /sobjects/Invoice__c/a007Q00000123xyz
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{sObjectName}/{recordId}";

                // Add fields query parameter if specified
                if (!string.IsNullOrWhiteSpace(fields))
                {
                    uri += $"?fields={Uri.EscapeDataString(fields)}";
                }

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        // Parse JSON response
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                        Result.Set(context, result);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Custom object '{recordId}' retrieved successfully.");
                    }
                    else
                    {
                        Result.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve custom object. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Result.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving custom object: {ex.Message}");
            }
        }
    }
}