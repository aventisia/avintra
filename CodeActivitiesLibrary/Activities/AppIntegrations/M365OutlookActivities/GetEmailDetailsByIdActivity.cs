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
    [DisplayName("Get Email Details by ID")]
    [Description("Fetches full email details (including attachments) from Outlook using the Graph API by message ID.")]
    [ActivityMetaData(nodeImg: "/assets/M365.svg")]
    public class GetEmailDetailsByIdActivity : BaseCodeActivity
    {
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
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Message ID")]
        [Description("The unique ID of the email message.")]
        public InArgument<string> MessageId { get; set; }

        [DisplayName("Email Details (JSON)")]
        [Description("The full email message object returned as a JSON object.")]
        public OutArgument<JObject> EmailDetails { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string userEmail = UserEmail.Get(context);
            string messageId = MessageId.Get(context);

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

                        string graphUrl = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages/{messageId}?$expand=attachments";

                        var response = await client.GetAsync(graphUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            string jsonResponse = await response.Content.ReadAsStringAsync();
                            EmailDetails.Set(context, JObject.Parse(jsonResponse));
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Email details retrieved successfully.");
                        }
                        else
                        {
                            string errorResponse = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to retrieve email. Status: {response.ReasonPhrase}, Response: {errorResponse}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception retrieving email details: {ex.Message}");
            }
        }
    }
}
