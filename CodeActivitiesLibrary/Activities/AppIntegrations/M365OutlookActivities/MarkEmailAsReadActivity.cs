using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Mark Email as Read/Unread")]
    [Description("Marks an email as read or unread using Microsoft Graph API.")]
    [ActivityMetaData(nodeImg: "/assets/Outlook.svg")]
    public class MarkEmailAsReadActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Message ID")]
        [Description("The ID of the message to update.")]
        public InArgument<string> MessageId { get; set; }

        [RequiredArgument]
        [DisplayName("Is Read")]
        [Description("True to mark as read; false to mark as unread.")]
        public InArgument<bool> IsRead { get; set; }
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure Active Directory tenant (directory) ID.")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD application (client) ID.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("Azure AD application client secret.")]
        public InArgument<string> ClientSecret { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            string userEmail = UserEmail.Get(context);
            string messageId = MessageId.Get(context);
            bool isRead = IsRead.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);

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

                        var payload = new { isRead = isRead };
                        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

                        var url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages/{messageId}";

                        var method = new HttpMethod("PATCH");
                        var request = new HttpRequestMessage(method, url) { Content = content };
                        var response = await client.SendAsync(request);

                        if (response.IsSuccessStatusCode)
                        {
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Email marked successfully.");
                        }
                        else
                        {
                            string error = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to mark email. Response: {error}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception marking email: {ex.Message}");
            }
        }
    }
}
