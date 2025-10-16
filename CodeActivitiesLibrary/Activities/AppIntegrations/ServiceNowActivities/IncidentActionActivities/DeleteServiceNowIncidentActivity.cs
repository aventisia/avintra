using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Delete ServiceNow Incident")]
    [Description("Deletes a ServiceNow incident by sys_id using a stored Credential ID / Token.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class DeleteServiceNowIncidentActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential ID / Token")]
        [Description("ServiceNow credential ID, Base64 token, or OAuth2 token")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Incident sys_id")]
        [Description("sys_id of the incident to delete")]
        public InArgument<string> IncidentId { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Deleted Incident ID")]
        [Description("The sys_id of the deleted incident")]
        public OutArgument<string> DeletedIncidentId { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string incidentId = IncidentId.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID / Token is required.");
                if (string.IsNullOrWhiteSpace(incidentId))
                    throw new ArgumentException("IncidentId is required.");

                // Build URL using CredentialId as subdomain
                string baseUrl = $"https://{credentialId}.service-now.com";
                string uri = $"{baseUrl}/api/now/table/incident/{incidentId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use CredentialId directly as Bearer token
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        DeletedIncidentId.Set(context, incidentId);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Incident deleted successfully: {incidentId}");
                    }
                    else if ((int)response.StatusCode == 404)
                    {
                        DeletedIncidentId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Incident not found: {incidentId}");
                    }
                    else
                    {
                        DeletedIncidentId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to delete incident. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                DeletedIncidentId.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting ServiceNow incident: {ex.Message}");
            }
        }
    }
}
