using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Create Salesforce Attachment")]
    [Description("Creates a new Attachment record in Salesforce linked to a parent record (e.g., Account, Contact).")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public sealed class CreateAttachmentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Parent ID")]
        [Description("The Salesforce ID of the parent record (e.g., Account, Contact) to attach the file to.")]
        public InArgument<string> ParentId { get; set; }

        [RequiredArgument]
        [DisplayName("Name")]
        [Description("The name of the attachment file (required).")]
        public InArgument<string> Name { get; set; }

        [RequiredArgument]
        [DisplayName("File Content")]
        [Description("The binary content of the file to upload (byte[]).")]
        public InArgument<byte[]> FileContent { get; set; }

        [DisplayName("Input Binary Field")]
        [Description("The name of the binary field in the request body. Default is 'Body'.")]
        public InArgument<string> InputBinaryField { get; set; }
        [DisplayName("Additional Fields")]
        [Description("Optional additional fields such as Description, ContentType, etc.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("Created Attachment ID")]
        [Description("The Salesforce ID of the newly created Attachment record.")]
        public OutArgument<string> AttachmentId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after creating the attachment.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var parentId = ParentId.Get(context);
                var name = Name.Get(context);
                var fileContent = FileContent.Get(context);
                var binaryFieldName = InputBinaryField.Get(context);
                var additionalFields = AdditionalFields.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(parentId))
                    throw new ArgumentException("Parent ID is required.");

                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Attachment Name is required.");

                if (fileContent == null || fileContent.Length == 0)
                    throw new ArgumentException("File Content is null or empty.");

                if (string.IsNullOrWhiteSpace(binaryFieldName))
                    binaryFieldName = "Body"; // Default Salesforce field for attachment body

                // Deserialize credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build request body
                var requestBody = new Dictionary<string, object>
                {
                    { "Name", name },
                    { "ParentId", parentId }
                };

                // Add additional fields
                if (additionalFields != null)
                {
                    foreach (var field in additionalFields)
                    {
                        if (!string.IsNullOrEmpty(field.Key))
                            requestBody[field.Key] = field.Value;
                    }
                }

                // Add Base64-encoded file content to the specified binary field (usually 'Body')
                requestBody[binaryFieldName] = Convert.ToBase64String(fileContent);

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                // Send request
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Attachment/";

                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        dynamic result = JsonConvert.DeserializeObject(responseContent);
                        string id = result?.id?.ToString();

                        AttachmentId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Attachment created successfully with ID: {id}");
                    }
                    else
                    {
                        AttachmentId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to create attachment. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                AttachmentId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating attachment: {ex.Message}");
            }
        }
    }
}