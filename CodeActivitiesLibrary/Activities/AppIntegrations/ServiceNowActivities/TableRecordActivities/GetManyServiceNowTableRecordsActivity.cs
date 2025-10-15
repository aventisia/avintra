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
    [DisplayName("Get Many ServiceNow Table Records")]
    [Description("Retrieves multiple records from a ServiceNow table using only the provided Credential ID or token. Supports pagination.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class GetManyServiceNowTableRecordsActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Instance URL")]
        [Description("Full ServiceNow instance URL (e.g., https://dev12345.service-now.com).")]
        public InArgument<string> InstanceUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Credential / Token")]
        [Description("For BasicAuth → provide Base64(username:password). For OAuth2 → provide Bearer token.")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("Name of the ServiceNow table (e.g., incident, change_request, problem).")]
        public InArgument<string> TableName { get; set; }

        [DisplayName("Return All")]
        [Description("If true, retrieves all records across pages. If false, only returns up to 'Limit' records.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Max number of records to retrieve when Return All = false. Max: 1000.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), "false")]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Options")]
        [Description("Query parameters (e.g., state=1^active=true or sysparm_fields=number,short_description).")]
        public InArgument<string> Options { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Records")]
        [Description("Array of retrieved records.")]
        public OutArgument<JArray> Records { get; set; }

        [DisplayName("Total Count")]
        [Description("Number of retrieved records.")]
        public OutArgument<int> TotalCount { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Inputs
                string instanceUrl = InstanceUrl.Get(context);
                string credentialId = CredentialId.Get(context);
                string tableName = TableName.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                string options = Options.Get(context);

                if (string.IsNullOrWhiteSpace(instanceUrl))
                    throw new ArgumentException("Instance URL is required.");
                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential/Token is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                int pageSize = returnAll ? 1000 : Math.Max(1, Math.Min(limit, 1000));
                string baseUri = $"{instanceUrl}/api/now/table/{tableName}";
                var queryParams = new List<string> { $"sysparm_limit={pageSize}" };

                if (!string.IsNullOrWhiteSpace(options))
                {
                    if (options.StartsWith("sysparm_"))
                        queryParams.Add(options);
                    else
                        queryParams.Add($"sysparm_query={options}");
                }

                string uri = baseUri + "?" + string.Join("&", queryParams);

                using (var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) })
                {

                    httpClient.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json"));

                    // Collect records
                    var allRecords = new JArray();
                    string nextPage = uri;

                    while (!string.IsNullOrEmpty(nextPage))
                    {
                        HttpResponseMessage response = httpClient.GetAsync(nextPage).GetAwaiter().GetResult();
                        string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                        // Keep last response for debugging
                        Response.Set(context, responseContent);

                        if (!response.IsSuccessStatusCode)
                        {
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to fetch records. Status: {response.StatusCode}, Response: {responseContent}");
                            return;
                        }

                        JObject jsonResponse;
                        try
                        {
                            jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                        }
                        catch (JsonException ex)
                        {
                            throw new InvalidOperationException("Invalid JSON received from ServiceNow.", ex);
                        }

                        JArray results = jsonResponse?["result"] as JArray;
                        if (results != null)
                        {
                            foreach (JObject record in results)
                                allRecords.Add(record);
                        }

                        if (!returnAll) break;

                        string nextLink = jsonResponse?["next"]?["link"]?.ToString();
                        if (string.IsNullOrEmpty(nextLink)) break;

                        nextPage = new Uri(new Uri(instanceUrl), nextLink).ToString();
                    }

                    // Outputs
                    Records.Set(context, allRecords);
                    TotalCount.Set(context, allRecords.Count);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allRecords.Count} records from '{tableName}'.");
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Records.Set(context, null);
                TotalCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow records: {ex.Message}");
            }
        }
    }
}
