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
    [DisplayName("Create Salesforce Account")]
    [Description("Creates a new Account record in Salesforce using the provided credentials and account details.")]
    public sealed class CreateAccountActivity : BaseCodeActivity
    {
        // Input: Credential to connect with
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        // Input: Resource (must be 'Account')
        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Account'.")]
        public InArgument<string> Resource { get; set; }

        // Input: Operation (must be 'Create')
        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform on the resource. Must be 'Create'.")]
        public InArgument<string> Operation { get; set; }

        // Input: Name of the Account (required)
        [RequiredArgument]
        [DisplayName("Account Name")]
        [Description("The name of the Account to create (required).")]
        public InArgument<string> Name { get; set; }

        // Input: Additional Fields (e.g., Industry, Phone, Website)
        [DisplayName("Additional Fields")]
        [Description("Optional additional fields to include when creating the Account (e.g., Industry, Phone, Website).")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        // Output: Created Account ID
        [DisplayName("Created Account ID")]
        [Description("The Salesforce ID of the newly created Account record.")]
        public OutArgument<string> AccountId { get; set; }

        // Output: Response from Salesforce
        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after creating the Account.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string accountName = Name.Get(context);
                Dictionary<string, object> additionalFields = AdditionalFields.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(accountName))
                    throw new ArgumentException("Account Name is required.");

                if (!string.Equals(resource?.Trim(), "Account", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Account'.");

                if (!string.Equals(operation?.Trim(), "Create", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Create'.");

                // Deserialize credential
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0"; // Default API version

                // Build request body
                var requestBody = new Dictionary<string, object>
                {
                    { "Name", accountName }
                };

                if (additionalFields != null)
                {
                    foreach (var field in additionalFields)
                    {
                        if (!string.IsNullOrEmpty(field.Key))
                            requestBody[field.Key] = field.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                // Prepare HTTP request
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/";
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                    // Send POST request
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(responseContent);
                        string accountId = result?.id?.ToString();

                        AccountId.Set(context, accountId);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Account created successfully with ID: {accountId}");
                    }
                    else
                    {
                        AccountId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create Account. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                AccountId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating Account: {ex.Message}");
            }
        }
    }
}