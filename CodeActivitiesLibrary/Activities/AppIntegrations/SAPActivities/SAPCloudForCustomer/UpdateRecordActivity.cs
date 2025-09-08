using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Update Record")]
    [Description("Updates a record in SAP Cloud for Customer.")]
    public class UpdateRecordCustomerActivity : CodeActivity
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
        [Description("The key value of the record to update (e.g., 'SO0000000001').")]
        public InArgument<string> KeyValue { get; set; }

        [RequiredArgument]
        [DisplayName("Record Data")]
        [Description("The updated record data in JSON format.")]
        public InArgument<string> RecordData { get; set; }

        [DisplayName("Response")]
        [Description("The response from the C4C server after updating the record.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string scope = Scope.Get(context);
            string subdomain = Subdomain.Get(context);
            string entitySetName = EntitySetName.Get(context);
            string keyValue = KeyValue.Get(context);
            string recordData = RecordData.Get(context);

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
            if (string.IsNullOrWhiteSpace(recordData))
                throw new ArgumentException("Record Data is required.");

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
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json");

                    var content = new StringContent(recordData, Encoding.UTF8, "application/json");
                    var response = client.PutAsync(requestUri, content).Result;
                    response.EnsureSuccessStatusCode();

                    string result = response.Content.ReadAsStringAsync().Result;
                    Response.Set(context, result);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to update record: {ex.Message}", ex);
            }
        }

    }
}

