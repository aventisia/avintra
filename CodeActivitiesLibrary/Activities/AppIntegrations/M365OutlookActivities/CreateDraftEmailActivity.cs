using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Create Draft Email")]
    [Description("Creates a draft email message in the user's mailbox using Microsoft Graph API.")]
    public class CreateDraftEmailActivity : BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Email Message JSON")]
        [Description("JSON string representing the draft email content (subject, body, recipients, etc.).")]
        public InArgument<string> EmailJson { get; set; }

        [DisplayName("Draft ID")]
        [Description("The ID of the created draft email.")]
        public OutArgument<string> DraftId { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string userEmail = UserEmail.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string jsonBody = EmailJson.Get(context);

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

                        var requestContent = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                        string requestUrl = $"https://graph.microsoft.com/v1.0/users/{userEmail}/messages";
                        var response = await client.PostAsync(requestUrl, requestContent);

                        if (response.IsSuccessStatusCode)
                        {
                            var result = JsonConvert.DeserializeObject<JObject>(await response.Content.ReadAsStringAsync());
                            DraftId.Set(context, result["id"]?.ToString());
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, "Draft created successfully.");
                        }
                        else
                        {
                            string error = await response.Content.ReadAsStringAsync();
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to create draft. Response: {error}");
                        }
                    }
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception creating draft: {ex.Message}");
            }
        }
    }
}
