using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Delete ServiceNow Attachment")]
    [Description("Deletes an attachment from ServiceNow using only Credential ID (BasicAuth token or OAuth2 token).")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class DeleteServiceNowAttachmentByIdActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Instance URL")]
        [Description("Full instance URL, e.g., https://dev12345.service-now.com")]
        public InArgument<string> InstanceUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Credential ID / Token")]
        [Description("For BasicAuth → provide Base64(username:password). For OAuth2 → provide Bearer token.")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Attachment ID")]
        [Description("The sys_id of the attachment to delete.")]
        public InArgument<string> AttachmentId { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Inputs
                string instanceUrl = InstanceUrl.Get(context);
                string credentialId = CredentialId.Get(context);
                string attachmentId = AttachmentId.Get(context);

                if (string.IsNullOrWhiteSpace(instanceUrl))
                    throw new ArgumentException("Instance URL is required.");
                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID / Token is required.");
                if (string.IsNullOrWhiteSpace(attachmentId))
                    throw new ArgumentException("Attachment ID is required.");

                using (var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) })
                {
                    // 🔐 Authentication: auto-detect
                    if (credentialId.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Bearer", credentialId.Replace("Bearer ", ""));
                    }
                    else
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Basic", credentialId); // assume base64
                    }

                    httpClient.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json"));

                    // DELETE request
                    string uri = $"{instanceUrl.TrimEnd('/')}/api/now/attachment/{attachmentId}";
                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Attachment deleted successfully: {attachmentId}");
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
                StatusMessage.Set(context, $"Error deleting ServiceNow attachment: {ex.Message}");
            }
        }
    }
}
