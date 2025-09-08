using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Get Task Summary")]
    [Description("Retrieves a summary of a Salesforce task by its ID.")]
    public class GetTaskSummaryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Task ID")]
        [Description("The ID of the task to retrieve the summary for.")]
        public InArgument<string> TaskId { get; set; }

        [DisplayName("Task Summary")]
        [Description("The retrieved task summary as a JSON string.")]
        public OutArgument<string> TaskSummary { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var taskId = TaskId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(taskId))
                    throw new ArgumentException("Task ID is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build endpoint: /sobjects/Task/00T7Q00000123xyz
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Task/{taskId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        // Parse response
                        var taskData = JsonConvert.DeserializeObject<Newtonsoft.Json.Linq.JObject>(responseContent);

                        // Extract key fields for summary
                        var summary = new
                        {
                            Id = taskData["Id"]?.ToString(),
                            Subject = taskData["Subject"]?.ToString(),
                            Status = taskData["Status"]?.ToString(),
                            Priority = taskData["Priority"]?.ToString(),
                            WhoId = taskData["WhoId"]?.ToString(),
                            WhatId = taskData["WhatId"]?.ToString(),
                            CreatedDate = taskData["CreatedDate"]?.ToString(),
                            LastModifiedDate = taskData["LastModifiedDate"]?.ToString()
                        };

                        string summaryJson = JsonConvert.SerializeObject(summary, Formatting.Indented);

                        TaskSummary.Set(context, summaryJson);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Task '{taskId}' summary retrieved successfully.");
                    }
                    else
                    {
                        TaskSummary.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve task summary. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                TaskSummary.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving task summary: {ex.Message}");
            }
        }
    }
}