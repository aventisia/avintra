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
    [DisplayName("Update ServiceNow User")]
    [Description("Updates an existing user in ServiceNow by sys_id using the provided CredentialId directly.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class UpdateServiceNowUserActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Base64 token or OAuth2 token)")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("User ID")]
        [Description("The sys_id of the user to update")]
        public InArgument<string> UserId { get; set; }

        [RequiredArgument]
        [DisplayName("Fields to Update")]
        [Description("List of key-value pairs representing field names and values to update.")]
        public InArgument<List<KeyValuePair<string, string>>> UpdateFields { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Updated User")]
        [Description("The updated user record as JObject")]
        public OutArgument<JObject> UpdatedUser { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string userId = UserId.Get(context);
                var updateFields = UpdateFields.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(userId))
                    throw new ArgumentException("User ID (sys_id) is required.");

                // Build request body
                JObject requestBody = new JObject();
                if (updateFields != null)
                {
                    foreach (var field in updateFields)
                    {
                        if (!string.IsNullOrWhiteSpace(field.Key))
                            requestBody[field.Key] = JToken.FromObject(field.Value ?? string.Empty);
                    }
                }

                string jsonBody = requestBody.ToString();

                // Build URL
                string baseUrl = $"https://{credentialId}.service-now.com"; // Using CredentialId as subdomain
                string uri = $"{baseUrl}/api/now/table/sys_user/{userId}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    // Use CredentialId directly as Bearer token
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send PUT request
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PutAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent)?["result"] as JObject;
                        UpdatedUser.Set(context, result);

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"User updated successfully: {userId}");
                    }
                    else
                    {
                        UpdatedUser.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update user. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                UpdatedUser.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating ServiceNow user: {ex.Message}");
            }
        }
    }
}
