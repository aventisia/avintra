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
    [DisplayName("Get Many Users")]
    [Description("Retrieves multiple Salesforce user records using SOQL.")]
    public class GetManyUsersActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Return All")]
        [Description("If enabled, retrieves all users without limit. If disabled, uses the Limit value.")]
        [DefaultValue(false)]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of users to retrieve. Only visible when 'Return All' is disabled.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), false)]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Options")]
        [Description("Additional properties to include in the request (e.g., fields to select).")]
        public InArgument<Dictionary<string, object>> Options { get; set; }

        [DisplayName("Users")]
        [Description("The list of retrieved users as JSON array.")]
        public OutArgument<string> Users { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var returnAll = ReturnAll.Get(context);
                var limit = Limit.Get(context);
                var options = Options.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build SOQL query
                string soql = "SELECT Id, Name, Email, Username, IsActive FROM User";
                if (!returnAll && limit > 0)
                    soql += $" LIMIT {limit}";

                // Encode query and build URI
                string encodedQuery = Uri.EscapeDataString(soql);
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/query?q={encodedQuery}";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Send GET request
                    HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Users.Set(context, responseContent);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Retrieved users successfully.");
                    }
                    else
                    {
                        Users.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve users. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Users.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving users: {ex.Message}");
            }
        }
    }
}