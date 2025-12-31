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
    [DisplayName("Create Task")]
    [Description("Creates a new task in Salesforce.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public class CreateTaskActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Status Name or ID")]
        [Description("The status of the task (e.g., 'Completed', 'Not Started').")]
        public InArgument<string> StatusNameOrId { get; set; }

        [RequiredArgument]
        [DisplayName("Subject")]
        [Description("The subject of the task (required).")]
        public InArgument<string> Subject { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Additional field-value pairs to set on the task (e.g., WhoId, WhatId, Priority).")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Task ID")]
        [Description("The ID of the created task.")]
        public OutArgument<string> TaskId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var status = StatusNameOrId.Get(context);
                var subject = Subject.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(subject))
                    throw new ArgumentException("Subject is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build task data
                var taskData = new Dictionary<string, object>
                {
                    { "Subject", subject },
                    { "Status", status },
                    { "Priority", "Normal" } // Default priority
                };

                // Add additional fields
                if (additionalFields != null)
                {
                    foreach (var kv in additionalFields)
                    {
                        taskData[kv.Key] = kv.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(taskData);

                // Build endpoint: /sobjects/Task
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Task";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                        string id = result.ContainsKey("id") ? result["id"].ToString() : null;

                        TaskId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Task created successfully with ID: {id}.");
                    }
                    else
                    {
                        TaskId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create task. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                TaskId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating task: {ex.Message}");
            }
        }
    }
}