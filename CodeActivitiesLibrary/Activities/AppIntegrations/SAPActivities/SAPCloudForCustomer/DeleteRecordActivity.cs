using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Delete Record")]
    [Description("Deletes a record in SAP Cloud for Customer.")]
    public class DeleteRecordCustomerActivity  : BaseCodeActivity
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
        [DisplayName("Entity Set Name")]
        [Description("The name of the OData entity set (e.g., 'SalesOrder').")]
        public InArgument<string> EntitySetName { get; set; }

        [RequiredArgument]
        [DisplayName("Key Value")]
        [Description("The key value of the record to delete (e.g., 'SO0000000001').")]
        public InArgument<string> KeyValue { get; set; }

        [DisplayName("Response")]
        [Description("The response from the C4C server after deletion.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string scope = Scope.Get(context);
            string subdomain = Subdomain.Get(context);
            string entitySetName = EntitySetName.Get(context);
            string keyValue = KeyValue.Get(context);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(clientId))
                throw new ArgumentException("Client ID is required.");
            if (string.IsNullOrWhiteSpace(clientSecret))
                throw new ArgumentException("Client Secret is required.");
            if (string.IsNullOrWhiteSpace(scope))
                throw new ArgumentException("Scope is required.");
            if (string.IsNullOrWhiteSpace(subdomain))
                throw new ArgumentException("Subdomain is required.");
            if (string.IsNullOrWhiteSpace(entitySetName))
                throw new ArgumentException("Entity Set Name is required.");
            if (string.IsNullOrWhiteSpace(keyValue))
                throw new ArgumentException("Key Value is required.");

            try
            {
                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new GetAccessTokenCloudForCustomersHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);
              
                string baseUrl = $"https://{subdomain}.crm.ondemand.com";
                string requestUri = $"{baseUrl}/api/{entitySetName}('{keyValue}')";

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                    client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                    var response = client.DeleteAsync(requestUri).Result;
                    response.EnsureSuccessStatusCode();

                    string result = response.Content.ReadAsStringAsync().Result;
                    Response.Set(context, result);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to delete record: {ex.Message}", ex);
            }
        }

       
    }
}