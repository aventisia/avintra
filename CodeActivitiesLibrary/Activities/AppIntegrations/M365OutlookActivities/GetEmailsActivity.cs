using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365.Graph.Outlook
{
    [DisplayName("Get Emails")]
    [Description("Retrieves top 10 emails from the Inbox folder using Microsoft Graph API.")]
    public class GetEmailsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("User Email")]
        [Description("The email address of the mailbox owner.")]
        public InArgument<string> UserEmail { get; set; }

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


        [DisplayName("Emails JSON")]
        [Description("List of emails retrieved from the user's Inbox in JSON format.")]
        public OutArgument<JArray> Emails { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string userEmail = UserEmail.Get(context);
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

                        string url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/mailFolders/Inbox/messages?$top=10";

                        var response = await client.GetAsync(url);

                        if (response.IsSuccessStatusCode)
                        {
                            var result = JObject.Parse(await response.Content.ReadAsStringAsync());
                            Emails.Set(context, (JArray)result["value"]);
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Emails retrieved successfully.");
                        }
                        else
                        {
                            string error = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to retrieve emails. Response: {error}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception retrieving emails: {ex.Message}");
            }
        }
    }
}
