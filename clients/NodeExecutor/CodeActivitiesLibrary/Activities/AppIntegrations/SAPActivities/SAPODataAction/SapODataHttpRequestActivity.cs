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
    [DisplayName("SAP OData HTTP Request")]
    [Description("Perform HTTP requests to interact with SAP OData using existing connector and connection.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class SapODataHttpRequestActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection URL")]
        [Description("The base URL of the SAP OData service endpoint.")]
        [DefaultValue("https://your-sap-server/sap/opu/odata/sap/")]
        public InArgument<string> ConnectionUrl { get; set; }

        [RequiredArgument]
        [DisplayName("HTTP Method")]
        [Description("The HTTP method to use for the request (GET, POST, PUT, DELETE).")]
        [DefaultValue("GET")]
        public InArgument<string> HttpMethod { get; set; }

        [RequiredArgument]
        [DisplayName("Request URI")]
        [Description("The relative URI path to the OData entity or action (e.g., SalesOrder(1)).")]
        [DefaultValue("/SalesOrder(1)")]
        public InArgument<string> RequestUri { get; set; }

        [DisplayName("Request Body")]
        [Description("The JSON payload to send in the request body (used for POST/PUT).")]
        [DefaultValue("")]
        public InArgument<string> RequestBody { get; set; }

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
        [Description("The raw JSON response from the OData server.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string connectionUrl = ConnectionUrl.Get(context);
            string httpMethod = HttpMethod.Get(context);
            string requestUri = RequestUri.Get(context);
            string requestBody = RequestBody.Get(context);
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

                // Create request
                var method = new HttpMethod(httpMethod);
                var uri = requestUri.StartsWith("/") ? requestUri.Substring(1) : requestUri;
                var fullUri = $"{uri}";

                var content = string.IsNullOrEmpty(requestBody) ? null : new StringContent(requestBody, Encoding.UTF8, "application/json");
                var request = new HttpRequestMessage(method, fullUri)
                {
                    Content = content
                };

                try
                {
                    Task<HttpResponseMessage> task = client.SendAsync(request);
                    HttpResponseMessage response = task.GetAwaiter().GetResult();
                    response.EnsureSuccessStatusCode();

                    Task<string> resultTask = response.Content.ReadAsStringAsync();
                    string result = resultTask.GetAwaiter().GetResult();

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Succesfully HTTP request interact with sap o data");
                    Response.Set(context, result);
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"HTTP request failed: {ex.Message}");
                }
               
            }
        }
    }
}