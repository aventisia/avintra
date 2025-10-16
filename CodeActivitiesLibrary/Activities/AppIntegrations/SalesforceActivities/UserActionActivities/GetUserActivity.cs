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
        [DisplayName("Get User")]
        [Description("Retrieves a Salesforce user record by its ID.")]
        [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
        public class GetUserActivity : BaseCodeActivity
        {
            [RequiredArgument]
            [DisplayName("Credential to connect with")]
            [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
            public InArgument<string> Credential { get; set; }

            [RequiredArgument]
            [DisplayName("User ID")]
            [Description("The Salesforce ID of the user to retrieve.")]
            public InArgument<string> UserId { get; set; }

            [DisplayName("User Data")]
            [Description("The retrieved user data as a JSON string.")]
            public OutArgument<string> UserData { get; set; }

            [DisplayName("Response")]
            [Description("The raw JSON response from Salesforce.")]
            public OutArgument<string> Response { get; set; }

            protected override void Execute(CodeActivityContext context)
            {
                try
                {
                    var credentialJson = Credential.Get(context);
                    var userId = UserId.Get(context);

                    // Validate inputs
                    if (string.IsNullOrWhiteSpace(credentialJson))
                        throw new ArgumentException("Credential is required.");
                    if (string.IsNullOrWhiteSpace(userId))
                        throw new ArgumentException("User ID is required.");

                    // Parse credentials
                    var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                    if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                        throw new InvalidOperationException("Invalid or missing credentials.");

                    if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                        throw new ArgumentException("InstanceUrl is missing.");
                    if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                        credentials.ApiVersion = "57.0";

                    // Build endpoint: /sobjects/User/0057Q00000123xyz
                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/User/{userId}";

                    using (var httpClient = new HttpClient())
                    {
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        // Send GET request
                        HttpResponseMessage response = httpClient.GetAsync(uri).GetAwaiter().GetResult();
                        string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                        if (response.IsSuccessStatusCode)
                        {
                            UserData.Set(context, responseContent);
                            Response.Set(context, responseContent);
                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, $"User '{userId}' retrieved successfully.");
                        }
                        else
                        {
                            UserData.Set(context, null);
                            Response.Set(context, responseContent);
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to retrieve user. Status: {response.StatusCode}, Response: {responseContent}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    UserData.Set(context, null);
                    Response.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Error retrieving user: {ex.Message}");
                }
            }
        }
}
