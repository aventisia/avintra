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
    [DisplayName("Update Salesforce Contact")]
    [Description("Updates an existing Contact record in Salesforce.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class UpdateContactActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Contact ID")]
        [Description("The Salesforce ID of the Contact to update (required).")]
        public InArgument<string> ContactId { get; set; }

        [RequiredArgument]
        [DisplayName("Field Updates")]
        [Description("A dictionary of fields to update on the Contact (e.g., Email, Phone, Title).")]
        public InArgument<Dictionary<string, object>> FieldUpdates { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after updating the Contact.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var contactId = ContactId.Get(context);
                var updates = FieldUpdates.Get(context);

                if (string.IsNullOrWhiteSpace(contactId))
                    throw new ArgumentException("Contact ID is required.");

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

                string jsonBody = JsonConvert.SerializeObject(updates);
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Contact/{contactId}";

                    // Use SendAsync with HttpMethod.Patch for .NET Framework
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = content
                    };

                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Contact updated successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update Contact. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating Contact: {ex.Message}");
            }
        }
    }
}