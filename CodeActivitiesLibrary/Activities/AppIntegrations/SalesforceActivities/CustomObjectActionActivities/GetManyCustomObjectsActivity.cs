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
    [DisplayName("Get many custom objects")]
    [Description("Retrieves multiple custom objects from Salesforce using SOQL or default query.")]
    public class GetManyCustomObjectsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Custom Object API Name")]
        [Description("The API name of the custom object (e.g., 'Invoice__c').")]
        public InArgument<string> CustomObjectNameOrId { get; set; }

        [DisplayName("SOQL Query")]
        [Description("Optional custom SOQL query. If empty, retrieves all records with basic fields.")]
        public InArgument<string> SoqlQuery { get; set; }

        [DisplayName("Results")]
        [Description("The list of retrieved custom object records.")]
        public OutArgument<List<Dictionary<string, object>>> Results { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var sObjectName = CustomObjectNameOrId.Get(context);
                var soql = SoqlQuery.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(sObjectName))
                    throw new ArgumentException("Custom Object API Name is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build SOQL if not provided
                if (string.IsNullOrWhiteSpace(soql))
                {
                    // Default query: SELECT Id, Name FROM Invoice__c LIMIT 50
                    string nameField = sObjectName.Contains("__c") ? "Name" : "Name"; // Standard vs Custom
                    soql = $"SELECT Id, {nameField} FROM {sObjectName} LIMIT 50";
                }

                // Encode SOQL and build URI
                string encodedQuery = Uri.EscapeDataString(soql);
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={encodedQuery}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        // Parse response (Salesforce returns {"records": [...]})
                        var jsonResponse = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                        var records = new List<Dictionary<string, object>>();

                        if (jsonResponse.TryGetValue("records", out object recordsObj) && recordsObj is List<object> recordList)
                        {
                            foreach (var record in recordList)
                            {
                                if (record is Dictionary<string, object> rec)
                                {
                                    records.Add(rec);
                                }
                            }
                        }

                        Results.Set(context, records);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Retrieved {records.Count} custom object(s).");
                    }
                    else
                    {
                        Results.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve custom objects. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Results.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving custom objects: {ex.Message}");
            }
        }
    }
}