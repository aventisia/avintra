using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Update Salesforce Attachment")]
    [Description("Updates an existing Attachment record in Salesforce.")]
    public sealed class UpdateAttachmentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Attachment ID")]
        [Description("The Salesforce ID of the Attachment to update (required).")]
        public InArgument<string> AttachmentId { get; set; }

        [RequiredArgument]
        [DisplayName("Field Updates")]
        [Description("A dictionary of fields to update on the Attachment (e.g., Name, Description).")]
        public InArgument<Dictionary<string, object>> FieldUpdates { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after updating the attachment.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var attachmentId = AttachmentId.Get(context);
                var updates = FieldUpdates.Get(context);

                if (string.IsNullOrWhiteSpace(attachmentId))
                    throw new ArgumentException("Attachment ID is required.");

                if (updates == null || updates.Count == 0)
                    throw new ArgumentException("At least one field must be specified for update.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                string jsonBody = JsonConvert.SerializeObject(updates);
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Attachment/{attachmentId}";

                    // Use SendAsync for PATCH (since PatchAsync not available in .NET Framework)
                    var request = new HttpRequestMessage(new HttpMethod("PATCH"), uri)
                    {
                        Content = content
                    };

                    HttpResponseMessage response = httpClient.SendAsync(request).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Attachment updated successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to update attachment. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating attachment: {ex.Message}");
            }
        }
    }
}
