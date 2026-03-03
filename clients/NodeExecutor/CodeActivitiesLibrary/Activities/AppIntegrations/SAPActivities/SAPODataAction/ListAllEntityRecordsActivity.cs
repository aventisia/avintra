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
    [DisplayName("List All Entity Records")]
    [Description("Lists all records for a specified entity using SAP OData services.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class ListAllEntityRecordsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection URL")]
        [Description("The base URL of the SAP OData service endpoint.")]
        [DefaultValue("https://your-sap-server/sap/opu/odata/sap/")]
        public InArgument<string> ConnectionUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Entity Set Name")]
        [Description("The name of the OData entity set to list (e.g., 'SalesOrder').")]
        [DefaultValue("SalesOrder")]
        public InArgument<string> EntitySetName { get; set; }

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

        [DisplayName("Query Parameters")]
        [Description("Optional OData query parameters (e.g., $top=10&$filter=Status eq 'Active').")]
        [DefaultValue("")]
        public InArgument<string> QueryParameters { get; set; }

        [DisplayName("Response")]
        [Description("The list of records returned as JSON array from the OData server.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string connectionUrl = ConnectionUrl.Get(context);
            string entitySetName = EntitySetName.Get(context);
            string username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            string bearerToken = BearerToken.Get(context);
            string queryParameters = QueryParameters.Get(context);

            using (var client = new HttpClient())
            {
                // Set base address
                client.BaseAddress = new Uri(connectionUrl.TrimEnd('/') + "/");

                // Set headers
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

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

                // Build full URI with optional query parameters
                string requestUri = entitySetName;
                if (!string.IsNullOrEmpty(queryParameters))
                {
                    requestUri += "?" + queryParameters;
                }

                try
                {
                    Task<HttpResponseMessage> task = client.GetAsync(requestUri);
                    HttpResponseMessage response = task.GetAwaiter().GetResult();
                    response.EnsureSuccessStatusCode();

                    Task<string> resultTask = response.Content.ReadAsStringAsync();
                    string result = resultTask.GetAwaiter().GetResult();

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Succesfully list a record in SAP OData");
                    Response.Set(context, result);
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Failed to list record: {ex.Message}");
                }
            }
        }
    }
}