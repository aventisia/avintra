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
    [DisplayName("Get ServiceNow Incident")]
    [Description("Retrieves a single incident from ServiceNow by sys_id using a stored credential.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class GetServiceNowIncidentActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("Select the stored ServiceNow credential by ID")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Incident sys_id")]
        [Description("The sys_id of the incident to retrieve")]
        public InArgument<string> IncidentId { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Incident Details")]
        [Description("Parsed 'result' object from the response as JObject")]
        public OutArgument<JObject> Incident { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string incidentId = IncidentId.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(incidentId))
                    throw new ArgumentException("Incident sys_id is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");

                string baseUrl = $"https://{subdomain}.service-now.com";
                string uri = $"{baseUrl}/api/now/table/incident/{incidentId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use Bearer token as default
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                        JObject incident = jsonResponse?["result"] as JObject;
                        Incident.Set(context, incident);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Incident retrieved successfully: {incidentId}");
                    }
                    else
                    {
                        Incident.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve incident. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Incident.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow incident: {ex.Message}");
            }
        }
    }
}
