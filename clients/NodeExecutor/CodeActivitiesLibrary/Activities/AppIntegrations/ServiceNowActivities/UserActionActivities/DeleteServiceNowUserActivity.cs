using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Delete ServiceNow User")]
    [Description("Deletes a user from ServiceNow by sys_id using a stored credential.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class DeleteServiceNowUserActivity : BaseCodeActivity
    {
        #region Inputs
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Base64 token or OAuth2 token)")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("User ID")]
        [Description("The sys_id of the user to delete")]
        public InArgument<string> UserId { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string userId = UserId.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(userId))
                    throw new ArgumentException("User ID (sys_id) is required.");

                // Build URL (assuming subdomain is included in CredentialId or fixed)
                string baseUrl = $"https://{credentialId}.service-now.com"; // Adjust if needed
                string uri = $"{baseUrl}/api/now/table/sys_user/{userId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"User deleted successfully with sys_id: {userId}");
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to delete user. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting ServiceNow user: {ex.Message}");
            }
        }
    }
}
