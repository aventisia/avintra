using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Update Salesforce Account")]
    [Description("Updates an existing Account record in Salesforce using the provided credentials and account details.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class UpdateAccountActivity : BaseCodeActivity
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
        [Description("The operation to perform on the resource. Must be 'Update'.")]
        public InArgument<string> Operation { get; set; } = new InArgument<string>("Update");

        [RequiredArgument]
        [DisplayName("Account ID")]
        [Description("The Salesforce ID of the Account to update (required).")]
        public InArgument<string> AccountId { get; set; }

        [RequiredArgument]
        [DisplayName("Field Updates")]
        [Description("A dictionary of fields to update on the Account (e.g., Name, Phone, Industry).")]
        public InArgument<Dictionary<string, object>> FieldUpdates { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after updating the Account.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string accountId = AccountId.Get(context);
                Dictionary<string, object> updates = FieldUpdates.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(accountId))
                    throw new ArgumentException("Account ID is required.");

                if (!string.Equals(resource?.Trim(), "Account", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Account'.");

                if (!string.Equals(operation?.Trim(), "Update", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Update'.");

                if (updates == null || updates.Count == 0)
                    throw new ArgumentException("At least one field must be specified for update.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Serialize update fields
                string jsonBody = JsonConvert.SerializeObject(updates);
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                // Prepare PATCH request
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/{accountId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    //  Use SendAsync with HttpMethod.Patch (for .NET Framework)
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = content
                    };

                    // Execute request
                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    // Handle response
                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Account updated successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update Account. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating Account: {ex.Message}");
            }
        }
    }
}