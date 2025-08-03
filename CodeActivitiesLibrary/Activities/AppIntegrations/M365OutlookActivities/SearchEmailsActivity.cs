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
    [DisplayName("Search Emails")]
    [Description("Searches inbox emails using a filter query (e.g., subject eq 'Test')")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Outlook.svg")]
    public class SearchEmailsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Filter Query")]
        [Description("OData filter query, e.g., subject eq 'Test'")]
        public InArgument<string> FilterQuery { get; set; }

        [DisplayName("Emails JSON")]
        [Description("Retrieved email messages in JSON format.")]
        public OutArgument<JArray> Emails { get; set; }

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
            string filterQuery = FilterQuery.Get(context);
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);

            try
            {
                // Get access token using the shared helper
                var tokenHelper = new GetAccessTokenHelper();
                string accessToken = tokenHelper.GetAccessTokenAsync(tenantId, clientId, clientSecret).Result;

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // NOTE: Removed unwanted space from URL
                    var url = $"https://graph.microsoft.com/v1.0/users/{userEmail}/mailFolders/Inbox/messages?$filter={Uri.EscapeDataString(filterQuery)}&$top=10";
                    var response = client.GetAsync(url).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        var result = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                        Emails.Set(context, (JArray)result["value"]);
                        StatusMessage.Set(context, "Emails searched successfully.");
                        IsSuccess.Set(context, true);
                    }
                    else
                    {
                        string error = response.Content.ReadAsStringAsync().Result;
                        StatusMessage.Set(context, $"Failed to search emails. Response: {error}");
                        IsSuccess.Set(context, false);
                    }
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Exception searching emails: {ex.Message}");
            }
        }
    }
}
