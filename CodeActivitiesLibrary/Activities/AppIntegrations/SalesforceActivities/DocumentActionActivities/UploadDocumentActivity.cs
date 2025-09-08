using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Upload Document")]
    [Description("Uploads a document to Salesforce as a ContentVersion (Salesforce File).")]
    public class UploadDocumentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Title")]
        [Description("The title of the document to upload")]
        public InArgument<string> Title { get; set; }

        [RequiredArgument]
        [DisplayName("File Content")]
        [Description("The binary content of the file to upload")]
        public InArgument<byte[]> FileContent { get; set; }

        [DisplayName("File Name")]
        [Description("The name of the file (e.g., 'report.pdf'). If not provided, defaults to 'document.dat'.")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Parent Record ID")]
        [Description("Optional: The ID of the record to link this file to (e.g., Lead, Account).")]
        public InArgument<string> ParentId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce after upload")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var title = Title.Get(context);
                var fileContent = FileContent.Get(context);
                var fileName = FileName.Get(context) ?? "document.dat";
                var parentId = ParentId.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(title))
                    throw new ArgumentException("Title is required.");
                if (fileContent == null || fileContent.Length == 0)
                    throw new ArgumentException("File Content is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build the request to create a ContentVersion (Salesforce File)
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/ContentVersion";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);

                    // Create multipart form data
                    var content = new MultipartFormDataContent();

                    // Required: VersionData (file binary)
                    var fileContentStream = new MemoryStream(fileContent);
                    content.Add(new StreamContent(fileContentStream), "VersionData", fileName);

                    // Required: Title
                    content.Add(new StringContent(title), "Title");

                    // Required: PathOnClient (used for file name)
                    content.Add(new StringContent(fileName), "PathOnClient");

                    // Optional: FirstPublishLocationId (link to record)
                    if (!string.IsNullOrWhiteSpace(parentId))
                    {
                        content.Add(new StringContent(parentId), "FirstPublishLocationId");
                    }

                    // Send POST request
                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Document '{title}' uploaded successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to upload document. Status: {response.StatusCode}, Response: {responseContent}");
                    }

                    // Clean up
                    content.Dispose();
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error uploading document: {ex.Message}");
            }
        }
    }
}