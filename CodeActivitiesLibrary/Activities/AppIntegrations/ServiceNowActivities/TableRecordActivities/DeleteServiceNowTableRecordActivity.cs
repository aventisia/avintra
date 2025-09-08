using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Delete ServiceNow Table Record")]
    [Description("Deletes a record from a ServiceNow table using the record sys_id and credential ID (BasicAuth → Base64(username:password) or OAuth2 → Bearer token).")]
    public class DeleteServiceNowTableRecordActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Instance URL")]
        [Description("Full ServiceNow instance URL (e.g., 'https://dev12345.service-now.com').")]
        public InArgument<string> InstanceUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Credential ID / Token")]
        [Description("For BasicAuth → provide Base64(username:password). For OAuth2 → provide Bearer token.")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Auth Method")]
        [Description("Authentication method: BasicAuth or OAuth2.")]
        public InArgument<ServiceNowAuthMethodEnum> AuthMethod { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("The ServiceNow table name (e.g., 'incident', 'cmdb_ci').")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Record Sys_Id")]
        [Description("The sys_id of the record to delete.")]
        public InArgument<string> SysId { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw response returned from ServiceNow API.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string instanceUrl = InstanceUrl.Get(context);
                string credentialId = CredentialId.Get(context);
                var authMethod = AuthMethod.Get(context);
                string tableName = TableName.Get(context);
                string sysId = SysId.Get(context);

                if (string.IsNullOrWhiteSpace(instanceUrl))
                    throw new ArgumentException("Instance URL is required.");
                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID / Token is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table name is required.");
                if (string.IsNullOrWhiteSpace(sysId))
                    throw new ArgumentException("Record sys_id is required.");

                using (var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) })
                {
                    // 🔐 Authentication
                    if (authMethod == ServiceNowAuthMethodEnum.BasicAuth)
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Basic", credentialId);
                    }
                    else if (authMethod == ServiceNowAuthMethodEnum.OAuth2)
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Bearer", credentialId);
                    }

                    httpClient.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json"));

                    // DELETE request
                    string uri = $"{instanceUrl}/api/now/table/{tableName}/{sysId}";
                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Record deleted successfully from {tableName}, sys_id: {sysId}");
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting ServiceNow record: {ex.Message}");
            }
        }
    }
}
