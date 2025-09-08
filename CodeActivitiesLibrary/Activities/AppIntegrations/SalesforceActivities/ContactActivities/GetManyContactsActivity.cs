using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Get Many Salesforce Contacts")]
    [Description("Retrieves multiple Contact records from Salesforce using SOQL query.")]
    public sealed class GetManyContactsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("SOQL Query")]
        [Description("The SOQL query to execute (e.g., SELECT Id, Name FROM Contact WHERE AccountId = '...').")]
        public InArgument<string> SoqlQuery { get; set; }

        [DisplayName("Contacts Data")]
        [Description("The list of Contact records returned as JSON array.")]
        public OutArgument<string> ContactsData { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var soqlQuery = SoqlQuery.Get(context);

                if (string.IsNullOrWhiteSpace(soqlQuery))
                    throw new ArgumentException("SOQL Query is required.");

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
                        ContactsData.Set(context, responseContent);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Retrieved {JsonConvert.DeserializeObject<dynamic>(responseContent)?.totalSize} contacts.");
                    }
                    else
                    {
                        ContactsData.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to query contacts. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                ContactsData.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error querying contacts: {ex.Message}");
            }
        }
    }
}