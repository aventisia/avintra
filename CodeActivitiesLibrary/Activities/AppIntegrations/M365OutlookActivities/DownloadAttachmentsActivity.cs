using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Download Attachments")]
    [Description("Downloads all attachments for a specified email message using Microsoft Graph API.")]
    [ActivityMetaData(nodeImg: "/assets/M365.svg")]
    public class DownloadAttachmentsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure Active Directory tenant (directory) ID.")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Azure AD application (client) ID.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Azure AD application client secret.")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Message ID")]
        [Description("The ID of the email message from which to download attachments.")]
        public InArgument<string> MessageId { get; set; }

        [DisplayName("Attachments JSON")]
        [Description("The list of attachments in JSON format.")]
        public OutArgument<JArray> Attachments { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string userEmail = UserEmail.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string messageId = MessageId.Get(context);

            try
            {
                var task = Task.Run(async () =>
                {
                    var tokenHelper = new GetAccessTokenHelper();
                    string accessToken = await tokenHelper.GetAccessTokenAsync(tenantId, clientId, clientSecret);

                    using (var client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        string requestUrl = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages/{messageId}/attachments";

                        var response = await client.GetAsync(requestUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            var result = JObject.Parse(await response.Content.ReadAsStringAsync());
                            Attachments.Set(context, (JArray)result["value"]);
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Attachments downloaded successfully.");
                        }
                        else
                        {
                            string error = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to download attachments. Response: {error}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception downloading attachments: {ex.Message}");
            }
        }
    }
}
