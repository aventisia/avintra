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
    [DisplayName("Get All ServiceNow Users")]
    [Description("Retrieves multiple users from ServiceNow using a stored credential. Supports pagination.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class GetAllServiceNowUsersActivity : BaseCodeActivity
    {
        #region Inputs
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Bearer token)")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all users across all pages. If disabled, only returns up to 'Limit' records.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of users to retrieve per request (used when Return All is off). Max: 1000.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), "false")]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Options")]
        [Description("Query parameters (e.g., active=true, sysparm_fields=user_name,short_description,email)")]
        public InArgument<string> Options { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from the last page (or first if error)")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Users")]
        [Description("List of retrieved users as JObject array")]
        public OutArgument<JArray> Users { get; set; }

        [DisplayName("Total Count")]
        [Description("Total number of users retrieved")]
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
                string baseUri = $"{baseUrl}/api/now/table/sys_user";

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

                    var allUsers = new JArray();
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
                                foreach (JObject user in results)
                                    allUsers.Add(user);

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
                            StatusMessage.Set(context, $"Failed to fetch users. Status: {response.StatusCode}, Response: {responseContent}");
                            return;
                        }
                    }

                    Users.Set(context, allUsers);
                    TotalCount.Set(context, allUsers.Count);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allUsers.Count} users successfully.");
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Users.Set(context, null);
                TotalCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow users: {ex.Message}");
            }
        }
    }
}
