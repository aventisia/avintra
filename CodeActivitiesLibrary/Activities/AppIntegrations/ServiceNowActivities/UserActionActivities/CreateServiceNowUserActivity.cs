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
    [DisplayName("Create ServiceNow User")]
    [Description("Creates a new user in ServiceNow using a stored credential.")]
    public class CreateServiceNowUserActivity : BaseCodeActivity
    {
        #region Inputs
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Base64 token or OAuth2 token)")]
        public InArgument<string> CredentialId { get; set; }

        [DisplayName("Short Description")]
        [Description("Full name or display name of the user (e.g., John Doe)")]
        public InArgument<string> ShortDescription { get; set; }

        [DisplayName("Additional Fields")]
        [Description("List of key-value pairs representing additional user fields (e.g., email, phone)")]
        public InArgument<List<KeyValuePair<string, string>>> AdditionalFields { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Created User")]
        [Description("The created user record as JObject")]
        public OutArgument<JObject> CreatedUser { get; set; }

        [DisplayName("User ID (sys_id)")]
        [Description("The sys_id of the created user")]
        public OutArgument<string> UserId { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                string shortDescription = ShortDescription.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(shortDescription))
                    throw new ArgumentException("Short Description is required.");

                // Build request body
                var requestBody = new JObject { ["short_description"] = shortDescription };

                if (additionalFields != null)
                {
                    foreach (var field in additionalFields)
                    {
                        if (!string.IsNullOrWhiteSpace(field.Key))
                            requestBody[field.Key] = field.Value ?? string.Empty;
                    }
                }

                string jsonBody = requestBody.ToString();

                // Build URL (assuming subdomain is included in CredentialId or fixed)
                string baseUrl = $"https://{credentialId}.service-now.com"; // Adjust as needed
                string uri = $"{baseUrl}/api/now/table/sys_user";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (response.IsSuccessStatusCode)
                    {
                        JObject result = JsonConvert.DeserializeObject<JObject>(responseContent)?["result"] as JObject;
                        CreatedUser.Set(context, result);
                        UserId.Set(context, result?["sys_id"]?.ToString());

                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"User created successfully with sys_id: {result?["sys_id"]}");
                    }
                    else
                    {
                        CreatedUser.Set(context, null);
                        UserId.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create user. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                CreatedUser.Set(context, null);
                UserId.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating ServiceNow user: {ex.Message}");
            }
        }
    }
}
