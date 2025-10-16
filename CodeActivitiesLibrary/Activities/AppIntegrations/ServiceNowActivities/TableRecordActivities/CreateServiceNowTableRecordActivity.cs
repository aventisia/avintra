using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Create ServiceNow Table Record")]
    [Description("Creates a new record in a specified ServiceNow table using InstanceUrl + Credential ID/Token.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class CreateServiceNowTableRecordActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Instance URL")]
        [Description("Full instance URL, e.g., https://dev12345.service-now.com")]
        public InArgument<string> InstanceUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Credential ID / Token")]
        [Description("For BasicAuth → provide Base64(username:password). For OAuth2 → provide Bearer token.")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("Name of the ServiceNow table (e.g., incident, change_request, problem).")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Data to Send")]
        [Description("How to send data: Auto-map inputs, define manually, or send nothing.")]
        public InArgument<DataToSendEnum> DataToSend { get; set; }

        [DisplayName("Fields to Send")]
        [Description("List of key-value pairs representing field names and values to send.")]
        [RenderIfCondition("DataToSend", DataToSendEnum.DefineBelowForEachColumn)]
        public InArgument<List<KeyValuePair<string, string>>> FieldsToSend { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Created Record")]
        [Description("The created record as JObject (contains sys_id, number, etc.).")]
        public OutArgument<JObject> CreatedRecord { get; set; }

        [DisplayName("Record ID (sys_id)")]
        [Description("The sys_id of the created record. Use this for Update, Delete, Get operations.")]
        public OutArgument<string> RecordId { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Inputs
                string instanceUrl = InstanceUrl.Get(context);
                string credentialId = CredentialId.Get(context);
                string tableName = TableName.Get(context);
                DataToSendEnum dataToSend = DataToSend.Get(context);
                var fieldsToSend = FieldsToSend.Get(context);

                // Validation
                if (string.IsNullOrWhiteSpace(instanceUrl))
                    throw new ArgumentException("Instance URL is required.");
                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID / Token is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                // Build URL
                string uri = $"{instanceUrl.TrimEnd('/')}/api/now/table/{tableName}";

                // Build request body
                var requestBody = new JObject();

                switch (dataToSend)
                {
                    case DataToSendEnum.DefineBelowForEachColumn:
                        if (fieldsToSend != null)
                        {
                            foreach (var field in fieldsToSend)
                            {
                                if (!string.IsNullOrWhiteSpace(field.Key))
                                {
                                    requestBody[field.Key] = JToken.FromObject(field.Value ?? string.Empty);
                                }
                            }
                        }
                        break;

                    case DataToSendEnum.Nothing:
                        // leave empty object
                        break;

                    case DataToSendEnum.AutoMapInputData:
                    default:
                        // Not implemented, reserved for future
                        break;
                }

                string jsonBody = requestBody.ToString();

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // 🔐 Authentication auto-detect
                    if (credentialId.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Bearer", credentialId.Replace("Bearer ", ""));
                    }
                    else
                    {
                        httpClient.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue("Basic", credentialId);
                    }

                    httpClient.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send POST
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent)?["result"] as JObject;
                        CreatedRecord.Set(context, result);

                        string sysId = result?["sys_id"]?.ToString();
                        RecordId.Set(context, sysId);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Record created successfully in '{tableName}' with sys_id: {sysId}");
                    }
                    else
                    {
                        CreatedRecord.Set(context, null);
                        RecordId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                CreatedRecord.Set(context, null);
                RecordId.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating ServiceNow record: {ex.Message}");
            }
        }
    }
}
