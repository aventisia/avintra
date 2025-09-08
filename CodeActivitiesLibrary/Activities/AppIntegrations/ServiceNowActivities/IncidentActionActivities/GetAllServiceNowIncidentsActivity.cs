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
    [DisplayName("Get All ServiceNow Incidents")]
    [Description("Retrieves all or limited incidents from ServiceNow using a stored credential. Supports pagination.")]
    public class GetAllServiceNowIncidentsActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("Select the stored ServiceNow credential by ID")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all incidents across all pages. If disabled, only returns up to 'Limit' records from the first page.")]

        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of incidents to retrieve per request (used when Return All is off). Max: 1000.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), "false")]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Options")]
        [Description("Query parameters or filters (e.g., state=1^priority=1)")]
        public InArgument<string> Options { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from the last page (or first if error)")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Incidents")]
        [Description("List of incident objects as JObject array")]
        public OutArgument<JArray> Incidents { get; set; }

        [DisplayName("Total Count")]
        [Description("Total number of incidents retrieved")]
        public OutArgument<int> TotalCount { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                string options = Options.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");

                int pageSize = returnAll ? 1000 : Math.Max(1, Math.Min(limit, 1000));
                string baseUrl = $"https://{subdomain}.service-now.com";
                string baseUri = $"{baseUrl}/api/now/table/incident";

                var queryParams = new List<string> { $"sysparm_limit={pageSize}" };
                if (!string.IsNullOrWhiteSpace(options))
                {
                    if (options.StartsWith("sysparm_"))
                        queryParams.Add(options);
                    else
                        queryParams.Add($"sysparm_query={options}");
                }

                string uri = baseUri + "?" + string.Join("&", queryParams);

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var allIncidents = new JArray();
                    string nextPage = uri;

                    while (!string.IsNullOrEmpty(nextPage))
                    {
                        HttpResponseMessage response = httpClient.GetAsync(nextPage).GetAwaiter().GetResult();
                        string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                        Response.Set(context, responseContent);

                        if (response.IsSuccessStatusCode)
                        {
                            JObject jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                            JArray results = jsonResponse?["result"] as JArray;
                            if (results != null)
                                foreach (JObject incident in results)
                                    allIncidents.Add(incident);

                            if (!returnAll)
                                break;

                            string nextLink = jsonResponse?["next"]?["link"]?.ToString();
                            if (string.IsNullOrEmpty(nextLink))
                                break;

                            nextPage = new Uri(new Uri(baseUrl), nextLink).ToString();
                        }
                        else
                        {
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to fetch incidents. Status: {response.StatusCode}, Response: {responseContent}");
                            return;
                        }
                    }

                    Incidents.Set(context, allIncidents);
                    TotalCount.Set(context, allIncidents.Count);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allIncidents.Count} incidents successfully.");
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Incidents.Set(context, null);
                TotalCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow incidents: {ex.Message}");
            }
        }
    }
}
