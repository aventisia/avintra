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
    [DisplayName("Create or Update Salesforce Contact")]
    [Description("Creates a new Contact in Salesforce if it doesn't exist, or updates it if it does. Uses Email as the identifier.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class CreateOrUpdateContactActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Email")]
        [Description("The email address of the Contact (used as lookup key). Required for update. Optional for create.")]
        public InArgument<string> Email { get; set; }

        [RequiredArgument]
        [DisplayName("First Name")]
        [Description("The first name of the Contact (required).")]
        public InArgument<string> FirstName { get; set; }

        [RequiredArgument]
        [DisplayName("Last Name")]
        [Description("The last name of the Contact (required).")]
        public InArgument<string> LastName { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Optional additional fields such as Phone, Title, Department, etc.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Created or Updated Contact ID")]
        [Description("The Salesforce ID of the Contact after creation or update.")]
        public OutArgument<string> ContactId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after the operation.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var email = Email.Get(context);
                var firstName = FirstName.Get(context);
                var lastName = LastName.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(firstName))
                    throw new ArgumentException("First Name is required.");

                if (string.IsNullOrWhiteSpace(lastName))
                    throw new ArgumentException("Last Name is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Step 1: Try to find existing contact by Email
                string soqlQuery = string.IsNullOrEmpty(email) ?
                    $"SELECT Id FROM Contact WHERE FirstName = '{firstName.Replace("'", "''")}' AND LastName = '{lastName.Replace("'", "''")}' LIMIT 1" :
                    $"SELECT Id FROM Contact WHERE Email = '{email.Replace("'", "''")}' LIMIT 1";

                string queryUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={Uri.EscapeDataString(soqlQuery)}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage queryResponse = httpClient.GetAsync(queryUri).GetAwaiter().GetResult();
                    string queryContent = queryResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (queryResponse.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(queryContent);
                        string contactId = result?.records?[0]?.Id?.ToString();

                        if (!string.IsNullOrEmpty(contactId))
                        {
                            // Contact exists → Update
                            var updateBody = new Dictionary<string, object>
                        {
                            { "FirstName", firstName },
                            { "LastName", lastName }
                        };

                            if (!string.IsNullOrEmpty(email))
                                updateBody["Email"] = email;

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

                            string updateUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Contact/{contactId}";

                            // Use SendAsync for PATCH (since PatchAsync not available in .NET Framework)
                            var request = new HttpRequestMessage(new HttpMethod("PATCH"), updateUri)
                            {
                                Content = content
                            };

                            HttpResponseMessage updateResp = httpClient.SendAsync(request).GetAwaiter().GetResult();
                            string updateContent = updateResp.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                            if (updateResp.IsSuccessStatusCode)
                            {
                                ContactId.Set(context, contactId);
                                Response.Set(context, updateContent);
                                IsSuccess.Set(context, true);
                                StatusMessage.Set(context, $"Contact updated successfully with ID: {contactId}");
                            }
                            else
                            {
                                ContactId.Set(context, null);
                                Response.Set(context, updateContent);
                                IsSuccess.Set(context, false);
                                StatusMessage.Set(context, $"Failed to update Contact. Status: {updateResp.StatusCode}, Response: {updateContent}");
                            }
                        }
                        else
                        {
                            // Contact does not exist → Create
                            var createBody = new Dictionary<string, object>
                        {
                            { "FirstName", firstName },
                            { "LastName", lastName }
                        };

                            if (!string.IsNullOrEmpty(email))
                                createBody["Email"] = email;

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

                            string createUri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Contact/";
                            HttpResponseMessage createResp = httpClient.PostAsync(createUri, content).GetAwaiter().GetResult();
                            string createContent = createResp.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                            if (createResp.IsSuccessStatusCode)
                            {
                                dynamic createdResult = JsonConvert.DeserializeObject(createContent);
                                string newId = createdResult?.id?.ToString();

                                ContactId.Set(context, newId);
                                Response.Set(context, createContent);
                                IsSuccess.Set(context, true);
                                StatusMessage.Set(context, $"Contact created successfully with ID: {newId}");
                            }
                            else
                            {
                                ContactId.Set(context, null);
                                Response.Set(context, createContent);
                                IsSuccess.Set(context, false);
                                StatusMessage.Set(context, $"Failed to create Contact. Status: {createResp.StatusCode}, Response: {createContent}");
                            }
                        }
                    }
                    else
                    {
                        ContactId.Set(context, null);
                        Response.Set(context, queryContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to query Salesforce. Status: {queryResponse.StatusCode}, Response: {queryContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                ContactId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error in Create or Update Contact: {ex.Message}");
            }
        }
    }
}