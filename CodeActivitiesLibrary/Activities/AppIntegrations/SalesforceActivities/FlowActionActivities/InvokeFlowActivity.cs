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
    [DisplayName("Invoke Flow")]
    [Description("Invokes a Salesforce flow with input variables or JSON parameters.")]
    public class InvokeFlowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The resource type")]
        [DefaultValue("Flow")]
        public InArgument<string> Resource { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform")]
        [DefaultValue("Invoke")]
        public InArgument<string> Operation { get; set; }

        [RequiredArgument]
        [DisplayName("API Name")]
        [Description("The API name of the flow to invoke")]
        public InArgument<string> ApiName { get; set; }

        [DisplayName("JSON Parameters")]
        [Description("If enabled, uses JSON payload instead of variables. Variables will be hidden.")]
        [DefaultValue(false)]
        public InArgument<bool> UseJsonParameters { get; set; }

        [DisplayName("JSON Parameters")]
        [Description("JSON payload to pass to the flow. Only visible when 'JSON Parameters' is enabled.")]
        [DefaultValue("{}")]
        public InArgument<string> JsonParameters { get; set; }

        [DisplayName("Variables")]
        [Description("Input variables to pass to the flow. Only visible when 'JSON Parameters' is disabled.")]
        [RenderIfCondition(nameof(UseJsonParameters), false)]
        public InArgument<Dictionary<string, object>> Variables { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var apiName = ApiName.Get(context);
                var useJson = UseJsonParameters.Get(context);
                var jsonParams = JsonParameters.Get(context);
                var variables = Variables.Get(context);

                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(apiName))
                    throw new ArgumentException("API Name is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build request body
                var requestBody = new
                {
                    flowDefinition = new { name = apiName },
                    inputs = new[]
                    {
                        new
                        {
                            name = "inputValues",
                            type = "Map",
                            value = useJson && !string.IsNullOrEmpty(jsonParams)
                                ? JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonParams)
                                : (variables ?? new Dictionary<string, object>())
                        }
                    }
                };

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/tooling/sobjects/FlowInterview/";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                    var request = new HttpRequestMessage(new HttpMethod("POST"), uri) { Content = content };

                    var response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.Created)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Flow '{apiName}' invoked successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to invoke flow. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error invoking flow: {ex.Message}");
            }
        }
    }
}