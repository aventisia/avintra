using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Add a Comment to a Case")]
    [Description("Adds a comment to an existing Case in Salesforce.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class AddCommentToCaseActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Resource")]
        [Description("The Salesforce object to operate on. Must be 'Case'.")]
        public InArgument<string> Resource { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The operation to perform. Must be 'Add a comment to a case'.")]
        public InArgument<string> Operation { get; set; }

        [RequiredArgument]
        [DisplayName("Case ID")]
        [Description("The Salesforce ID of the Case to add a comment to.")]
        public InArgument<string> CaseId { get; set; }

        [RequiredArgument]
        [DisplayName("Comment Body")]
        [Description("The text of the comment to add.")]
        public InArgument<string> CommentBody { get; set; }

        [DisplayName("Response")]
        [Description("The raw response from Salesforce after adding the comment.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialJson = Credential.Get(context);
                string resource = Resource.Get(context);
                string operation = Operation.Get(context);
                string caseId = CaseId.Get(context);
                string commentBody = CommentBody.Get(context);

                if (string.IsNullOrWhiteSpace(caseId))
                    throw new ArgumentException("Case ID is required.");

                if (string.IsNullOrWhiteSpace(commentBody))
                    throw new ArgumentException("Comment Body is required.");

                if (!string.Equals(resource?.Trim(), "Case", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Resource must be 'Case'.");

                if (!string.Equals(operation?.Trim(), "Add a comment to a case", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Operation must be 'Add a comment to a case'.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredential>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Post to /services/data/vXX.X/sobjects/Case/{id}/comments
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/{resource}/{caseId}/comments";
                var requestBody = new Dictionary<string, object>
            {
                { "CommentBody", commentBody }
            };

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, true);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Comment added to Case '{caseId}' successfully.");
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        Response.Set(context, responseContent);
                        StatusMessage.Set(context, $"Failed to add comment. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                Response.Set(context, null);
                StatusMessage.Set(context, $"Error adding comment: {ex.Message}");
            }
        }

        private class SalesforceCredential
        {
            public string InstanceUrl { get; set; }
            public string AccessToken { get; set; }
            public string ApiVersion { get; set; }
        }
    }
}
