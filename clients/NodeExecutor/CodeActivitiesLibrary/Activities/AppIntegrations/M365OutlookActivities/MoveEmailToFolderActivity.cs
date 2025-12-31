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
    [DisplayName("Move Email To Folder")]
    [Description("Moves an email to a specified folder using Microsoft Graph API.")]
    [ActivityMetaData(nodeImg: "/assets/M365.svg")]
    public class MoveEmailToFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Message ID")]
        [Description("The ID of the email message to move.")]
        public InArgument<string> MessageId { get; set; }

        [RequiredArgument]
        [DisplayName("Folder ID")]
        [Description("The destination folder ID to move the message into.")]
        public InArgument<string> FolderId { get; set; }

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
            string folderId = FolderId.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);

            try
            {
                var task = Task.Run(async () =>
                {
                    var tokenHelper = new GetAccessTokenHelper();
                    var accessToken = await tokenHelper.GetAccessTokenAsync(tenantId, clientId, clientSecret);

                    using (var client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var payload = new { destinationId = folderId };
                        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

                        // Clean URL: no space after /users/
                        var url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages/{messageId}/move";

                        var response = await client.PostAsync(url, content);

                        if (response.IsSuccessStatusCode)
                        {
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Email moved successfully.");
                        }
                        else
                        {
                            string error = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to move email. Response: {error}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception moving email: {ex.Message}");
            }
        }
    }
}
