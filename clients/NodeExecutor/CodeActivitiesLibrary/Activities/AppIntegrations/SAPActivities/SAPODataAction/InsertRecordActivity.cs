using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Insert Record")]
    [Description("Inserts a new record in SAP OData.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class InsertRecordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection URL")]
        [Description("The base URL of the SAP OData service endpoint.")]
        [DefaultValue("https://your-sap-server/sap/opu/odata/sap/")]
        public InArgument<string> ConnectionUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Entity Set Name")]
        [Description("The name of the OData entity set where the record will be inserted (e.g., 'SalesOrder').")]
        [DefaultValue("SalesOrder")]
        public InArgument<string> EntitySetName { get; set; }

        [RequiredArgument]
        [DisplayName("Record Data")]
        [Description("The new record data in JSON format to insert.")]
        [DefaultValue("{\"CustomerID\":\"CUST123\",\"Amount\":1000}")]
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
        [Description("The response from the OData server after inserting the record.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string connectionUrl = ConnectionUrl.Get(context);
            string entitySetName = EntitySetName.Get(context);
            string recordData = RecordData.Get(context);
            string username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            string bearerToken = BearerToken.Get(context);

            using (var client = new HttpClient())
            {
                // Set base address
                client.BaseAddress = new Uri(connectionUrl.TrimEnd('/') + "/");

                // Set headers
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json");

                // Add authentication
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
                string requestUri = entitySetName;

                try
                {
                    // Create POST request with JSON body
                    var content = new StringContent(recordData, Encoding.UTF8, "application/json");
                    var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
                    {
                        Content = content
                    };

                    // Send request
                    Task<HttpResponseMessage> task = client.SendAsync(request);
                    HttpResponseMessage response = task.GetAwaiter().GetResult();
                    response.EnsureSuccessStatusCode();

                    // Read response
                    Task<string> resultTask = response.Content.ReadAsStringAsync();
                    string result = resultTask.GetAwaiter().GetResult();

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Succesfully insert a record in SAP OData");
                    Response.Set(context, result);
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Failed to insert record: {ex.Message}");
                }
            }
        }
    }
}