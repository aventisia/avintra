using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Identity.Client;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Send Email")]
    [Description("Sends an email via the Microsoft Graph API using application permissions.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Outlook.svg")]
    public class SendEmailM365Activity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Email Message JSON")]
        [Description("The JSON string representing the email message to send.")]
        public InArgument<string> EmailJson { get; set; }

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
            try
            {
                string userEmail = UserEmail.Get(context);
                string jsonBody = EmailJson.Get(context);
                string tenantId = TenantId.Get(context);
                string clientId = ClientId.Get(context);
                string clientSecret = ClientSecret.Get(context);

                if (string.IsNullOrWhiteSpace(jsonBody))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Email JSON is null or empty.");
                    return;
                }

                // Use helper class here
                var tokenHelper = new GetAccessTokenHelper();
                string accessToken = tokenHelper
                    .GetAccessTokenAsync(tenantId, clientId, clientSecret)
                    .GetAwaiter()
                    .GetResult(); // preferred over .Result

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var requestContent = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");

                    var url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/sendMail";
                    var response = client.PostAsync(url, requestContent).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Email sent successfully.");
                    }
                    else
                    {
                        string errorResponse = response.Content.ReadAsStringAsync().Result;
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to send email. Response: {errorResponse}");
                    }
                }

            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Exception sending email: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}
