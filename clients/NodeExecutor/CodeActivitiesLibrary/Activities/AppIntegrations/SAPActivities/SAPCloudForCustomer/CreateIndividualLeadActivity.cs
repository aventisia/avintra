using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Create Individual Lead")]
    [Description("Creates an individual lead not associated with any company in SAP Cloud for Customer.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class CreateIndividualLeadActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP C4C App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP C4C App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., 'com.sap.cloud.c4c.api').")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("Subdomain")]
        [Description("Your SAP C4C subdomain (e.g., 'mycompany' in mycompany.crm.ondemand.com).")]
        public InArgument<string> Subdomain { get; set; }

        [RequiredArgument]
        [DisplayName("Lead Data")]
        [Description("The new lead data in JSON format (e.g., {\"FirstName\": \"John\", \"LastName\": \"Doe\", \"Status\": \"New\"}).")]
        public InArgument<string> LeadData { get; set; }

        [DisplayName("Response")]
        [Description("The response from the C4C server after creating the lead.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string scope = Scope.Get(context);
            string subdomain = Subdomain.Get(context);
            string leadData = LeadData.Get(context);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(clientId))
                throw new ArgumentException("Client ID is required.");
            if (string.IsNullOrWhiteSpace(clientSecret))
                throw new ArgumentException("Client Secret is required.");
            if (string.IsNullOrWhiteSpace(scope))
                throw new ArgumentException("Scope is required.");
            if (string.IsNullOrWhiteSpace(subdomain))
                throw new ArgumentException("Subdomain is required.");
            if (string.IsNullOrWhiteSpace(leadData))
                throw new ArgumentException("Lead Data is required.");

            try
            {
                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new GetAccessTokenCloudForCustomersHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                string baseUrl = $"https://{subdomain}.crm.ondemand.com";
                string requestUri = $"{baseUrl}/api/Lead";

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                    client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json");

                    var content = new StringContent(leadData, Encoding.UTF8, "application/json");
                    var response = client.PostAsync(requestUri, content).Result;
                    response.EnsureSuccessStatusCode();

                    string result = response.Content.ReadAsStringAsync().Result;
                    Response.Set(context, result);
                }
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Failed to create individual lead: {ex.Message}");
                IsSuccess.Set(context, false);
                Response.Set(context, "");
                
            }
        }

      
    }
}