using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Update ServiceNow Table Record")]
    [Description("Updates an existing record in a specified ServiceNow table by sys_id using a stored credential.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class UpdateServiceNowTableRecordActivity : BaseCodeActivity
    {
        #region Inputs
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Base64 token or OAuth2 token)")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Table Name or ID")]
        [Description("Name or sys_id of the ServiceNow table (e.g., incident, change_request)")]
        public InArgument<string> TableName { get; set; }

        [DisplayName("Table Record ID")]
        [Description("The sys_id of the record to update")]
        public InArgument<string> RecordId { get; set; }

        [DisplayName("Fields to Send")]
        [Description("List of key-value pairs representing field names and values to update.")]
        public InArgument<List<KeyValuePair<string, string>>> FieldsToSend { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Updated Record")]
        [Description("The updated record as JObject")]
        public OutArgument<JObject> UpdatedRecord { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string tableName = TableName.Get(context);
                string recordId = RecordId.Get(context);
                var fieldsToSend = FieldsToSend.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");
                if (string.IsNullOrWhiteSpace(recordId))
                    throw new ArgumentException("Record ID (sys_id) is required.");

                // Build request body
                var requestBody = new JObject();
                if (fieldsToSend != null)
                {
                    foreach (var field in fieldsToSend)
                    {
                        if (!string.IsNullOrWhiteSpace(field.Key))
                            requestBody[field.Key] = JToken.FromObject(field.Value ?? string.Empty);
                    }
                }

                string jsonBody = requestBody.ToString();

                // Build URL
                string baseUrl = $"https://{credentialId}.service-now.com"; // Using CredentialId as subdomain
                string uri = $"{baseUrl}/api/now/table/{tableName}/{recordId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use CredentialId directly as Bearer token
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send PUT request
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PutAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent)?["result"] as JObject;
                        UpdatedRecord.Set(context, result);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Record updated successfully: {tableName}/{recordId}");
                    }
                    else
                    {
                        UpdatedRecord.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update record. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                UpdatedRecord.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating ServiceNow record: {ex.Message}");
            }
        }
    }
}
