using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Get ServiceNow Table Record")]
    [Description("Retrieves a specific record from a ServiceNow table by sys_id using a stored credential.")]
    public class GetServiceNowTableRecordActivity : BaseCodeActivity
    {
        #region Inputs
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Base64 token or OAuth2 token)")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Table Name or ID")]
        [Description("Name or sys_id of the ServiceNow table (e.g., incident, change_request, problem)")]
        public InArgument<string> TableName { get; set; }

        [DisplayName("Table Record ID")]
        [Description("The sys_id of the record to retrieve")]
        public InArgument<string> RecordId { get; set; }

        [DisplayName("Options")]
        [Description("Additional query parameters (e.g., sysparm_fields=number,short_description)")]
        public InArgument<string> Options { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Record")]
        [Description("The retrieved record as JObject (contains sys_id, number, etc.)")]
        public OutArgument<JObject> Record { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string tableName = TableName.Get(context);
                string recordId = RecordId.Get(context);
                string options = Options.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");
                if (string.IsNullOrWhiteSpace(recordId))
                    throw new ArgumentException("Record ID (sys_id) is required.");

                // Build URL
                string baseUrl = $"https://{credentialId}.service-now.com"; // Using CredentialId as subdomain directly
                string uri = $"{baseUrl}/api/now/table/{tableName}/{recordId}";

                if (!string.IsNullOrWhiteSpace(options))
                {
                    uri += (uri.Contains("?") ? "&" : "?") + options;
                }

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use CredentialId directly as Bearer token
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                        JObject result = jsonResponse?["result"] as JObject;
                        Record.Set(context, result);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Record retrieved successfully: {tableName}/{recordId}");
                    }
                    else
                    {
                        Record.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve record. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Record.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow record: {ex.Message}");
            }
        }
    }
}
