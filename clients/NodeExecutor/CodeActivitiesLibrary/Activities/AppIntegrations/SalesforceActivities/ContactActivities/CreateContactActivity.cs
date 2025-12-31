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
    [DisplayName("Create Salesforce Contact")]
    [Description("Creates a new Contact record in Salesforce using the provided credentials and contact details.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class CreateContactActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("First Name")]
        [Description("The first name of the Contact (required).")]
        public InArgument<string> FirstName { get; set; }

        [RequiredArgument]
        [DisplayName("Last Name")]
        [Description("The last name of the Contact (required).")]
        public InArgument<string> LastName { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Optional additional fields such as Email, Phone, Title, etc.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Created Contact ID")]
        [Description("The Salesforce ID of the newly created Contact record.")]
        public OutArgument<string> ContactId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after creating the Contact.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var firstName = FirstName.Get(context);
                var lastName = LastName.Get(context);
                var additionalFields = AdditionalFields.Get(context);

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

                var requestBody = new Dictionary<string, object>
                {
                    { "FirstName", firstName },
                    { "LastName", lastName }
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

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Contact/";

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(responseContent);
                        string id = result?.id?.ToString();

                        ContactId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Contact created successfully with ID: {id}");
                    }
                    else
                    {
                        ContactId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create Contact. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                ContactId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating Contact: {ex.Message}");
            }
        }
    }
}