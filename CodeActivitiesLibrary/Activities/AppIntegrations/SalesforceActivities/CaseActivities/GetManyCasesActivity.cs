using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Get Many Cases")]
    [Description("Retrieves multiple Case records using a SOQL query.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class GetManyCasesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Case'.")]
        public InArgument<string> Resource { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform. Must be 'Get many cases'.")]
        public InArgument<string> Operation { get; set; }

        [RequiredArgument]
        [DisplayName("SOQL Query")]
        [Description("SOQL query to retrieve multiple Cases (e.g., SELECT Id, Subject FROM Case WHERE Status = 'New').")]
        public InArgument<string> SoqlQuery { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response containing the list of Cases.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string soqlQuery = SoqlQuery.Get(context);

                if (string.IsNullOrWhiteSpace(soqlQuery))
                    throw new ArgumentException("SOQL Query is required.");

                if (!string.Equals(resource?.Trim(), "Case", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Case'.");

                if (!string.Equals(operation?.Trim(), "Get many cases", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Get many cases'.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredential>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string encodedQuery = Uri.EscapeDataString(soqlQuery);
                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={encodedQuery}";

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Successfully retrieved {JsonConvert.DeserializeObject<dynamic>(responseContent)?.totalSize} cases.");
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Failed to retrieve Cases. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                Response.Set(context, null);
                StatusMessage.Set(context, $"Error retrieving Cases: {ex.Message}");
            }
        }

        private class SalesforceCredential
        {
            public string InstanceUrl { get; set; }
            public string AccessToken { get; set; }
            public string ApiVersion { get; set; }
        }
    }
}
