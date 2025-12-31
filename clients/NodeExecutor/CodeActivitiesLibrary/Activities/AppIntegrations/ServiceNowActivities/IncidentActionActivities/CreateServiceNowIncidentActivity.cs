using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Create ServiceNow Incident")]
    [Description("Creates a new incident in ServiceNow using a stored credential ID or token.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class CreateServiceNowIncidentActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential ID / Token")]
        [Description("ServiceNow credential ID, Base64 token, or OAuth2 token")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Short Description")]
        [Description("Short description of the incident")]
        public InArgument<string> ShortDescription { get; set; }

        [DisplayName("Description")]
        [Description("Detailed description of the incident")]
        public InArgument<string> Description { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional fields as key-value pairs (e.g., 'urgency': '1')")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Incident Sys_Id")]
        [Description("The sys_id of the created incident")]
        public OutArgument<string> IncidentId { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string shortDesc = ShortDescription.Get(context);
                string description = Description.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID / Token is required.");
                if (string.IsNullOrWhiteSpace(shortDesc))
                    throw new ArgumentException("Short Description is required.");

                // Build request body
                var requestBody = new Dictionary<string, object>
                {
                    { "short_description", shortDesc }
                };
                if (!string.IsNullOrWhiteSpace(description))
                    requestBody["description"] = description;

                if (additionalFields != null)
                {
                    foreach (var field in additionalFields)
                    {
                        if (!string.IsNullOrEmpty(field.Key) && field.Value != null)
                            requestBody[field.Key] = field.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                // Build URL using CredentialId as subdomain
                string baseUrl = $"https://{credentialId}.service-now.com";
                string uri = $"{baseUrl}/api/now/table/incident";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use CredentialId directly as Bearer token
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent);
                        string sysId = result?["result"]?["sys_id"]?.ToString();
                        IncidentId.Set(context, sysId);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Incident created successfully with sys_id: {sysId}");
                    }
                    else
                    {
                        IncidentId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create incident. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                IncidentId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating ServiceNow incident: {ex.Message}");
            }
        }
    }
}
