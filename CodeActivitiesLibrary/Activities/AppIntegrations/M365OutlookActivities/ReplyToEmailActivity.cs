using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Reply to Email")]
    [Description("Replies to an email using Message ID.")]
    [ActivityMetaData(nodeImg: "/assets/M365.svg")]
    public class ReplyToEmailActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Message ID")]
        [Description("The ID of the message to reply to.")]
        public InArgument<string> MessageId { get; set; }

        [RequiredArgument]
        [DisplayName("Reply Message JSON")]
        [Description("The JSON string representing the reply message.")]
        public InArgument<string> ReplyJson { get; set; }

        [RequiredArgument]
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD Tenant ID (Directory ID).")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Azure AD Application (Client) ID.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Azure AD Application Client Secret.")]
        public InArgument<string> ClientSecret { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string userEmail = UserEmail.Get(context);
            string messageId = MessageId.Get(context);
            string replyJson = ReplyJson.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);

            try
            {
                // Create instance of your helper class
                var tokenHelper = new GetAccessTokenHelper();

                // Get access token synchronously (from async method)
                string accessToken = tokenHelper
                    .GetAccessTokenAsync(tenantId, clientId, clientSecret)
                    .GetAwaiter()
                    .GetResult();  // preferred over .Result to avoid deadlocks

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(replyJson, System.Text.Encoding.UTF8, "application/json");

                    // Remove the space after 'users/' and before the user email
                    var url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages/{messageId}/createReply";

                    var response = client.PostAsync(url, content).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        StatusMessage.Set(context, "Email replied successfully.");
                        IsSuccess.Set(context, true);
                    }
                    else
                    {
                        string errorResponse = response.Content.ReadAsStringAsync().Result;
                        StatusMessage.Set(context, $"Failed to reply to email. Response: {errorResponse}");
                        IsSuccess.Set(context, false);
                    }
                }
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Exception replying to email: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }


    }
}