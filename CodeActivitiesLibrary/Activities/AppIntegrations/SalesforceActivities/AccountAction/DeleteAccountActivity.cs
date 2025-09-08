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
    [DisplayName("Delete Salesforce Account")]
    [Description("Deletes an existing Account record from Salesforce by its ID.")]
    public sealed class DeleteAccountActivity : BaseCodeActivity
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
        [Description("The operation to perform on the resource. Must be 'Delete'.")]
        public InArgument<string> Operation { get; set; } = new InArgument<string>("Delete");

        [RequiredArgument]
        [DisplayName("Account ID")]
        [Description("The Salesforce ID of the Account to delete (required).")]
        public InArgument<string> AccountId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after deletion.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string accountId = AccountId.Get(context);

                if (string.IsNullOrWhiteSpace(accountId))
                    throw new ArgumentException("Account ID is required.");

                if (!string.Equals(resource?.Trim(), "Account", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Account'.");

                if (!string.Equals(operation?.Trim(), "Delete", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Delete'.");

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

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/{accountId}";

                    HttpResponseMessage response = httpClient.DeleteAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Account deleted successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to delete Account. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting Account: {ex.Message}");
            }
        }

    }
}
