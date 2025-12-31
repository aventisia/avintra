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
    [DisplayName("Get Many ServiceNow Attachments")]
    [Description("Retrieves multiple attachments from a ServiceNow table or record using a stored credential. Optionally downloads file contents.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class GetManyServiceNowAttachmentsActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("Select the stored ServiceNow credential by ID")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("Name of the table (e.g., incident) or sys_id of a record to filter attachments by")]
        public InArgument<string> TableNameOrId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all attachments across all pages. Otherwise, uses Limit.")]

        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of attachments to retrieve per request (used when Return All is off). Max: 1000.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), "false")]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Download Attachments")]
        [Description("If enabled, downloads the binary content of each attachment")]
        [DefaultValue(false)]
        public InArgument<bool> DownloadAttachments { get; set; }

        [DisplayName("Output Field")]
        [Description("Name of the output field where file data will be stored (e.g., 'data')")]
        [RequiredArgument]
        [RenderIfCondition("DownloadAttachments", "true")]
        public InArgument<string> OutputField { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Attachments")]
        [Description("List of attachment metadata (sys_id, file_name, content_type, etc.)")]
        public OutArgument<List<JObject>> Attachments { get; set; }

        [DisplayName("File Contents")]
        [Description("List of byte arrays containing file data (only if Download Attachments is enabled)")]
        [RenderIfCondition("DownloadAttachments", "true")]
        public OutArgument<List<byte[]>> FileContents { get; set; }

        [DisplayName("Total Count")]
        [Description("Total number of attachments retrieved")]
        public OutArgument<int> TotalCount { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string tableNameOrId = TableNameOrId.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                bool downloadAttachments = DownloadAttachments.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(tableNameOrId))
                    throw new ArgumentException("Table Name or ID is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");

                int pageSize = returnAll ? 1000 : Math.Max(1, Math.Min(limit, 1000));
                string baseUrl = $"https://{subdomain}.service-now.com";
                string uri = $"{baseUrl}/api/now/attachment?table={Uri.EscapeDataString(tableNameOrId)}&sysparm_limit={pageSize}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var allAttachments = new List<JObject>();
                    string nextPage = uri;

                    while (!string.IsNullOrEmpty(nextPage))
                    {
                        HttpResponseMessage response = httpClient.GetAsync(nextPage).GetAwaiter().GetResult();
                        string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                        Response.Set(context, responseContent);

                        if (!response.IsSuccessStatusCode)
                        {
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to retrieve attachments. Status: {response.StatusCode}, Response: {responseContent}");
                            return;
                        }

                        JObject jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                        JArray results = jsonResponse?["result"] as JArray;

                        if (results != null)
                        {
                            foreach (JObject attachment in results)
                                allAttachments.Add(attachment);
                        }

                        if (!returnAll)
                            break;

                        string nextLink = jsonResponse?["next"]?["link"]?.ToString();
                        if (string.IsNullOrEmpty(nextLink))
                            break;

                        nextPage = new Uri(new Uri(baseUrl), nextLink).ToString();
                    }

                    Attachments.Set(context, allAttachments);
                    TotalCount.Set(context, allAttachments.Count);

                    if (downloadAttachments)
                    {
                        var fileContents = new List<byte[]>();
                        foreach (var attachment in allAttachments)
                        {
                            string sysId = attachment["sys_id"]?.ToString();
                            if (string.IsNullOrEmpty(sysId)) continue;

                            string fileUri = $"{baseUrl}/api/now/attachment/{sysId}/file";
                            HttpResponseMessage fileResponse = httpClient.GetAsync(fileUri).GetAwaiter().GetResult();
                            if (fileResponse.IsSuccessStatusCode)
                                fileContents.Add(fileResponse.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult());
                        }

                        FileContents.Set(context, fileContents);
                    }

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allAttachments.Count} attachments{(downloadAttachments ? " with file data" : "")}");
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                Attachments.Set(context, null);
                FileContents.Set(context, null);
                TotalCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow attachments: {ex.Message}");
            }
        }
    }
}
