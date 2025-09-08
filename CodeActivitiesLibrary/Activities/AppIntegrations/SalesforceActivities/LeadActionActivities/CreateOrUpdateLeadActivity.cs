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
    [DisplayName("Create or update a lead")]
    [Description("Creates a new lead or updates an existing one using external ID field.")]
    public class CreateOrUpdateLeadActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("External ID Field")]
        [Description("The custom external ID field name (e.g., 'External_ID__c')")]
        public InArgument<string> ExternalIdField { get; set; }

        [RequiredArgument]
        [DisplayName("External ID Value")]
        [Description("The value of the external ID to upsert on")]
        public InArgument<string> ExternalIdValue { get; set; }

        [DisplayName("Fields")]
        [Description("JSON object containing fields to set")]
        public InArgument<string> FieldsJson { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var externalIdField = ExternalIdField.Get(context);
                var externalIdValue = ExternalIdValue.Get(context);
                var fieldsJson = FieldsJson.Get(context);

                if (string.IsNullOrWhiteSpace(externalIdField))
                    throw new ArgumentException("External ID Field is required.");
                if (string.IsNullOrWhiteSpace(externalIdValue))
                    throw new ArgumentException("External ID Value is required.");
                if (string.IsNullOrWhiteSpace(fieldsJson))
                    throw new ArgumentException("Fields are required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing in credential.");
                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing in credential.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                using (var httpClient = new HttpClient())
                {
                    // Set headers
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Build PATCH request
                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Lead/{externalIdField}/{externalIdValue}";

                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = new StringContent(fieldsJson, System.Text.Encoding.UTF8, "application/json")
                    };

                    // Send request
                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.NoContent)
                    {
                        // Salesforce returns 204 NoContent on successful upsert
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Lead with {externalIdField} = {externalIdValue} created or updated.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to upsert lead. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error upserting lead: {ex.Message}");
            }
        }
    }
}