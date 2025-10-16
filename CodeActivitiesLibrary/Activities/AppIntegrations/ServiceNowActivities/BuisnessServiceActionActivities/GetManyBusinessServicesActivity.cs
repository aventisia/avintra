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

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Get Many Business Services")]
    [Description("Retrieves multiple Business Services from ServiceNow using a stored credential. Supports pagination.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class GetManyBusinessServicesActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("Select the stored ServiceNow credential by ID")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all business services across all pages. If disabled, only returns up to 'Limit' records from the first page.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of business services to retrieve per request (used when Return All is off). Max: 1000.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), "false")]
        public InArgument<int> Limit { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from the last page (or first if error)")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Business Services")]
        [Description("List of business service records (sys_id, name, etc.)")]
        public OutArgument<List<JObject>> BusinessServices { get; set; }

        [DisplayName("Total Count")]
        [Description("Total number of business services retrieved")]
        public OutArgument<int> TotalCount { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");

                int pageSize = returnAll ? 1000 : Math.Max(1, Math.Min(limit, 1000));
                string baseUrl = $"https://{subdomain}.service-now.com";
                string baseUri = $"{baseUrl}/api/now/table/bmc_service";
                string uri = $"{baseUri}?sysparm_limit={pageSize}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var allServices = new List<JObject>();
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
                            {
                                foreach (JObject service in results)
                                    allServices.Add(service);
                            }

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
                            StatusMessage.Set(context, $"Failed to retrieve business services. Status: {response.StatusCode}, Response: {responseContent}");
                            return;
                        }
                    }

                    BusinessServices.Set(context, allServices);
                    TotalCount.Set(context, allServices.Count);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allServices.Count} business services.");
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                BusinessServices.Set(context, null);
                TotalCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving business services: {ex.Message}");
            }
        }
    }
}
