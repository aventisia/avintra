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
    [DisplayName("Create or Update Salesforce Account")]
    [Description("Creates a new Account in Salesforce if it doesn't exist, or updates it if it does. Uses Name as the identifier.")]
    public sealed class CreateOrUpdateAccountActivity : BaseCodeActivity
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
        public InArgument<string> Resource { get; set; } = new InArgument<string>("Account");

        // Input: Operation (must be 'CreateOrUpdate')
        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform on the resource. Must be 'CreateOrUpdate'.")]
        public InArgument<string> Operation { get; set; } = new InArgument<string>("CreateOrUpdate");

        // Input: Account Name (required)
        [RequiredArgument]
        [DisplayName("Account Name")]
        [Description("The name of the Account to create or update (required). Used as lookup key.")]
        public InArgument<string> Name { get; set; }

        // Input: Additional Fields (e.g., Industry, Phone, Website)
        [DisplayName("Additional Fields")]
        [Description("Optional additional fields to include when creating or updating the Account (e.g., Industry, Phone, Website).")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        // Output: Account ID (after create or update)
        [DisplayName("Account ID")]
        [Description("The Salesforce ID of the Account after creation or update.")]
        public OutArgument<string> AccountId { get; set; }

        // Output: Response from Salesforce
        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after the operation.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
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

                if (!string.Equals(operation?.Trim(), "CreateOrUpdate", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'CreateOrUpdate'.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Step 1: Query Salesforce to check if Account with this Name exists
                string soqlQuery = $"SELECT Id FROM Account WHERE Name = '{accountName.Replace("'", "''")}' LIMIT 1";
                string queryUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={Uri.EscapeDataString(soqlQuery)}";

                using (var httpClient = new HttpClient())
                {
                    // Set headers
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Execute SOQL query
                    HttpResponseMessage queryResponse = httpClient.GetAsync(queryUri).GetAwaiter().GetResult();
                    string queryContent = queryResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (queryResponse.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(queryContent);
                        string accountId = result?.records?[0]?.Id?.ToString();

                        if (!string.IsNullOrEmpty(accountId))
                        {
                            // Account exists → Update (PATCH)
                            var updateBody = new Dictionary<string, object> { { "Name", accountName } };

                            if (additionalFields != null)
                            {
                                foreach (var field in additionalFields)
                                {
                                    if (!string.IsNullOrEmpty(field.Key))
                                        updateBody[field.Key] = field.Value;
                                }
                            }

                            string jsonBody = JsonConvert.SerializeObject(updateBody);
                            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                            string updateUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/{accountId}";

                            // 🔧 Use SendAsync with HttpMethod.Patch for .NET Framework
                            var request = new HttpRequestMessage(new HttpMethod("PATCH"), updateUri)
                            {
                                Content = content
                            };

                            HttpResponseMessage updateResp = httpClient.SendAsync(request).GetAwaiter().GetResult();
                            string updateContent = updateResp.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                            if (updateResp.IsSuccessStatusCode)
                            {
                                AccountId.Set(context, accountId);
                                Response.Set(context, updateContent);
                                IsSuccess.Set(context, true);
                                StatusMessage.Set(context, $"Account updated successfully with ID: {accountId}");
                            }
                            else
                            {
                                AccountId.Set(context, null);
                                Response.Set(context, updateContent);
                                IsSuccess.Set(context, false);
                                StatusMessage.Set(context, $"Failed to update Account. Status: {updateResp.StatusCode}, Response: {updateContent}");
                            }
                        }
                        else
                        {
                            // Account does not exist → Create (POST)
                            var createBody = new Dictionary<string, object> { { "Name", accountName } };

                            if (additionalFields != null)
                            {
                                foreach (var field in additionalFields)
                                {
                                    if (!string.IsNullOrEmpty(field.Key))
                                        createBody[field.Key] = field.Value;
                                }
                            }

                            string jsonBody = JsonConvert.SerializeObject(createBody);
                            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                            string createUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/";
                            HttpResponseMessage createResp = httpClient.PostAsync(createUri, content).GetAwaiter().GetResult();
                            string createContent = createResp.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                            if (createResp.IsSuccessStatusCode)
                            {
                                dynamic createdResult = JsonConvert.DeserializeObject(createContent);
                                string newId = createdResult?.id?.ToString();

                                AccountId.Set(context, newId);
                                Response.Set(context, createContent);
                                IsSuccess.Set(context, true);
                                StatusMessage.Set(context, $"Account created successfully with ID: {newId}");
                            }
                            else
                            {
                                AccountId.Set(context, null);
                                Response.Set(context, createContent);
                                IsSuccess.Set(context, false);
                                StatusMessage.Set(context, $"Failed to create Account. Status: {createResp.StatusCode}, Response: {createContent}");
                            }
                        }
                    }
                    else
                    {
                        // Query failed
                        AccountId.Set(context, null);
                        Response.Set(context, queryContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to query Salesforce. Status: {queryResponse.StatusCode}, Response: {queryContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                AccountId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error in Create or Update Account: {ex.Message}");
            }
        }
    }
}