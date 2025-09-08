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
    [DisplayName("Get ServiceNow User")]
    [Description("Retrieves a user from ServiceNow by sys_id or username using a stored credential.")]
    public class GetServiceNowUserActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential")]
        [Description("The stored ServiceNow credential (Bearer token)")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Retrieve Identifier")]
        [Description("How to identify the user: by sys_id (ID) or username.")]
        public InArgument<RetrieveIdentifierEnum> RetrieveIdentifier { get; set; }

        [DisplayName("User ID")]
        [Description("The sys_id of the user to retrieve")]
        [RenderIfCondition("RetrieveIdentifier", "Id")]
        public InArgument<string> UserId { get; set; }

        [DisplayName("Username")]
        [Description("The login name of the user to retrieve")]
        [RenderIfCondition("RetrieveIdentifier", "Username")]
        public InArgument<string> UsernameValue { get; set; }

        [DisplayName("Options")]
        [Description("Additional query parameters (e.g., sysparm_fields=short_description,email)")]
        public InArgument<string> Options { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("Your ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("User")]
        [Description("The retrieved user record as JObject (contains sys_id, user_name, etc.)")]
        public OutArgument<JObject> User { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = CredentialId.Get(context);
                RetrieveIdentifierEnum identifier = RetrieveIdentifier.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(credentialId))
                    throw new ArgumentException("Credential ID is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow Subdomain is required.");
                // Determine query parameter
                string queryParam;
                switch (identifier)
                {
                    case RetrieveIdentifierEnum.Id:
                        string userId = UserId.Get(context);
                        if (string.IsNullOrWhiteSpace(userId))
                            throw new ArgumentException("User ID is required when Retrieve Identifier is 'ID'.");
                        queryParam = "sys_id=" + userId;
                        break;

                    case RetrieveIdentifierEnum.Username:
                        string username = UsernameValue.Get(context);
                        if (string.IsNullOrWhiteSpace(username))
                            throw new ArgumentException("Username is required when Retrieve Identifier is 'Username'.");
                        queryParam = "user_name=" + username;
                        break;

                    default:
                        throw new ArgumentException("Unsupported RetrieveIdentifier: " + identifier);
                }


                string baseUrl = $"https://{subdomain}.service-now.com";
                string uri = $"{baseUrl}/api/now/table/sys_user";

                var queryParams = new List<string> { queryParam };
                string options = Options.Get(context);
                if (!string.IsNullOrWhiteSpace(options))
                    queryParams.Add(options);

                uri += "?" + string.Join("&", queryParams);

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentialId);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    Response.Set(context, responseContent);

                    if (!response.IsSuccessStatusCode)
                    {
                        User.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve user. Status: {response.StatusCode}, Response: {responseContent}");
                        return;
                    }

                    JObject jsonResponse = JsonConvert.DeserializeObject<JObject>(responseContent);
                    JToken resultToken = jsonResponse?["result"];

                    if (resultToken == null)
                    {
                        User.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, "No 'result' found in response.");
                        return;
                    }

                    JObject userRecord = resultToken is JArray results && results.Count > 0
                        ? results[0] as JObject
                        : resultToken as JObject;

                    if (userRecord != null)
                    {
                        User.Set(context, userRecord);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"User retrieved successfully: {userRecord["short_description"] ?? userRecord["user_name"]}");
                    }
                    else
                    {
                        User.Set(context, null);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"No user found for {identifier}.");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                User.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow user: {ex.Message}");
            }
        }
    }

    public enum RetrieveIdentifierEnum
    {
        [Display(Name = "ID", Description = "Retrieve user by sys_id (unique identifier).")]
        Id,

        [Display(Name = "Username", Description = "Retrieve user by login name (user_name).")]
        Username
    }
}
