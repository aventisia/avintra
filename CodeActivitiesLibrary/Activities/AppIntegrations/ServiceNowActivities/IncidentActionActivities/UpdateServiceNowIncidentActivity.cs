using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities;
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
    [DisplayName("Update ServiceNow Incident")]
    [Description("Updates an existing ServiceNow incident by sys_id using a stored credential.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class UpdateServiceNowIncidentActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("Select the stored ServiceNow credential by ID")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Incident sys_id")]
        [Description("The sys_id of the incident to update")]
        public InArgument<string> IncidentId { get; set; }

        [DisplayName("Short Description")]
        [Description("New short description for the incident")]
        public InArgument<string> ShortDescription { get; set; }

        [DisplayName("Description")]
        [Description("New detailed description for the incident")]
        public InArgument<string> Description { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional fields to update as key-value pairs (e.g., 'urgency': '1')")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Updated Incident Sys_Id")]
        [Description("The sys_id of the updated incident")]
        public OutArgument<string> UpdatedIncidentId { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string incidentId = IncidentId.Get(context);
                string shortDesc = ShortDescription.Get(context);
                string desc = Description.Get(context);
                var additionalFields = AdditionalFields.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(incidentId))
                    throw new ArgumentException("Incident sys_id is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");

                var requestBody = new Dictionary<string, object>();
                if (!string.IsNullOrWhiteSpace(shortDesc))
                    requestBody["short_description"] = shortDesc;
                if (!string.IsNullOrWhiteSpace(desc))
                    requestBody["description"] = desc;

                if (additionalFields != null)
                {
                    foreach (var field in additionalFields)
                    {
                        if (!string.IsNullOrEmpty(field.Key) && field.Value != null)
                            requestBody[field.Key] = field.Value;
                    }
                }

                if (requestBody.Count == 0)
                    throw new ArgumentException("At least one field must be provided to update.");

                string jsonBody = JsonConvert.SerializeObject(requestBody);
                string baseUrl = $"https://{subdomain}.service-now.com";
                string uri = $"{baseUrl}/api/now/table/incident/{incidentId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PutAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent);
                        string updatedId = result?["result"]?["sys_id"]?.ToString();
                        UpdatedIncidentId.Set(context, updatedId);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Incident updated successfully: {updatedId}");
                    }
                    else
                    {
                        UpdatedIncidentId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update incident. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                UpdatedIncidentId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating ServiceNow incident: {ex.Message}");
            }
        }
    }
}
