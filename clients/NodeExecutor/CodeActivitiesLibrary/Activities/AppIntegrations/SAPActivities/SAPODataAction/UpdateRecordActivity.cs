using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Update Record")]
    [Description("Updates a record in SAP OData.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class UpdateRecordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection URL")]
        [Description("The base URL of the SAP OData service endpoint.")]
        [DefaultValue("https://your-sap-server/sap/opu/odata/sap/")]
        public InArgument<string> ConnectionUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Entity Set Name")]
        [Description("The name of the OData entity set (e.g., 'SalesOrder').")]
        [DefaultValue("SalesOrder")]
        public InArgument<string> EntitySetName { get; set; }

        [RequiredArgument]
        [DisplayName("Key Value")]
        [Description("The key value of the record to update (e.g., '0000000001').")]
        [DefaultValue("0000000001")]
        public InArgument<string> KeyValue { get; set; }

        [RequiredArgument]
        [DisplayName("Record Data")]
        [Description("The updated record data in JSON format.")]
        [DefaultValue("{\"Status\":\"Completed\"}")]
        public InArgument<string> RecordData { get; set; }

        [DisplayName("Username")]
        [Description("Username for Basic Authentication (if required).")]
        [DefaultValue("")]
        public InArgument<string> Username { get; set; }

        [DisplayName("Password")]
        [Description("Password for Basic Authentication (if required).")]
        [DefaultValue("")]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Bearer Token")]
        [Description("Bearer token for OAuth2 authentication (if required).")]
        [DefaultValue("")]
        public InArgument<string> BearerToken { get; set; }

        [DisplayName("Response")]
        [Description("The response from the OData server after updating the record.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string connectionUrl = ConnectionUrl.Get(context);
            string entitySetName = EntitySetName.Get(context);
            string keyValue = KeyValue.Get(context);
            string recordData = RecordData.Get(context);
            string username = Username.Get(context);
            string password = ConvertSecureStringToString(Password.Get(context));
            string bearerToken = BearerToken.Get(context);

            using (var client = new HttpClient())
            {
                // Setup base address and headers
                client.BaseAddress = new Uri(connectionUrl.TrimEnd('/') + "/");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json");

                // Authentication
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
                }
                else if (!string.IsNullOrEmpty(bearerToken))
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
                }

                // Build URI
                string requestUri = $"{entitySetName}({keyValue})";

                // Create request
                var request = new HttpRequestMessage(new HttpMethod("PUT"), requestUri)
                {
                    Content = new StringContent(recordData, Encoding.UTF8, "application/json")
                };

                try
                {
                    Task<HttpResponseMessage> task = client.SendAsync(request);
                    HttpResponseMessage response = task.GetAwaiter().GetResult();
                    response.EnsureSuccessStatusCode();

                    Task<string> resultTask = response.Content.ReadAsStringAsync();
                    string result = resultTask.GetAwaiter().GetResult();
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Succesfully update record");
                    Response.Set(context, result);
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Failed to update record: {ex.Message}");
                }
                
            }
        }
    }
}