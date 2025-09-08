using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
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
    [DisplayName("Get Multiple Salesforce Accounts")]
    [Description("Retrieves multiple Account records from Salesforce using SOQL query.")]
    public sealed class GetManyAccountsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Account'.")]
        public InArgument<string> Resource { get; set; } = new InArgument<string>("Account");

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform on the resource. Must be 'Query'.")]
        public InArgument<string> Operation { get; set; } = new InArgument<string>("Query");

        [RequiredArgument]
        [DisplayName("SOQL Query")]
        [Description("The SOQL query to execute (e.g., SELECT Id, Name FROM Account WHERE Name LIKE 'Test%').")]
        public InArgument<string> SoqlQuery { get; set; }

        [DisplayName("Accounts Data")]
        [Description("The list of Account records returned as JSON array.")]
        public OutArgument<string> AccountsData { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce.")]
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

                if (!string.Equals(resource?.Trim(), "Account", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Account'.");

                if (!string.Equals(operation?.Trim(), "Query", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Query'.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
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

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={Uri.EscapeDataString(soqlQuery)}";

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        AccountsData.Set(context, responseContent);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Retrieved {JsonConvert.DeserializeObject<dynamic>(responseContent)?.totalSize} accounts.");
                    }
                    else
                    {
                        AccountsData.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to query Accounts. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                AccountsData.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error querying Accounts: {ex.Message}");
            }
        }

    }
}
