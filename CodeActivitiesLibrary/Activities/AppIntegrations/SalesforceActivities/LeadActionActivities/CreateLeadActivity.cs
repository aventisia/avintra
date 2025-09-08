using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Create a lead")]
    [Description("Creates a new lead in Salesforce.")]
    public class CreateLeadActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Company")]
        [Description("The company name of the lead")]
        public InArgument<string> Company { get; set; }

        [RequiredArgument]
        [DisplayName("Last Name")]
        [Description("The last name of the lead")]
        public InArgument<string> LastName { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional field-value pairs to set on the lead")]
        public InArgument<string> AdditionalFieldsJson { get; set; }

        [DisplayName("Lead ID")]
        [Description("The ID of the created lead")]
        public OutArgument<string> LeadId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var company = Company.Get(context);
                var lastName = LastName.Get(context);
                var additionalFieldsJson = AdditionalFieldsJson.Get(context);

                if (string.IsNullOrWhiteSpace(company))
                    throw new ArgumentException("Company is required.");
                if (string.IsNullOrWhiteSpace(lastName))
                    throw new ArgumentException("Last Name is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                var leadData = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;
                leadData["Company"] = company;
                leadData["LastName"] = lastName;

                if (!string.IsNullOrWhiteSpace(additionalFieldsJson))
                {
                    var additional = JsonConvert.DeserializeObject<Dictionary<string, object>>(additionalFieldsJson);
                    foreach (var kv in additional)
                        leadData[kv.Key] = kv.Value;
                }

                string jsonBody = JsonConvert.SerializeObject(leadData);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Lead";

                    var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                        string id = result["id"]?.ToString();
                        LeadId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Lead created successfully with ID: {id}");
                    }
                    else
                    {
                        LeadId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create lead. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                LeadId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating lead: {ex.Message}");
            }
        }
    }
}