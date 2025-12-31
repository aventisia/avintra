using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [DisplayName("Upload ServiceNow Attachment")]
    [Description("Uploads a file as an attachment to a record in ServiceNow using a Bearer token.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class UploadServiceNowAttachmentActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential (Bearer Token)")]
        [Description("The ServiceNow access token (OAuth2 Bearer token).")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("ServiceNow Subdomain")]
        [Description("The ServiceNow instance subdomain (e.g., 'dev12345')")]
        public InArgument<string> Subdomain { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("Name of the table (e.g., incident, change_request)")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Record Sys ID")]
        [Description("The sys_id of the record to attach the file to")]
        public InArgument<string> RecordSysId { get; set; }

        [RequiredArgument]
        [DisplayName("File Content (Byte Array)")]
        [Description("The file content as byte array")]
        public InArgument<byte[]> FileContent { get; set; }

        [RequiredArgument]
        [DisplayName("File Name")]
        [Description("Name of the file including extension (e.g., screenshot.png)")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Content Type")]
        [Description("MIME type of the file (e.g., image/png, application/pdf). Default: application/octet-stream")]
        public InArgument<string> ContentType { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Attachment Sys ID")]
        [Description("The sys_id of the created attachment (if successful)")]
        public OutArgument<string> AttachmentSysId { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string accessToken = CredentialId.Get(context);
                string subdomain = Subdomain.Get(context);
                string tableName = TableName.Get(context);
                string recordSysId = RecordSysId.Get(context);
                byte[] fileContent = FileContent.Get(context);
                string fileName = FileName.Get(context);
                string contentType = ContentType.Get(context) ?? "application/octet-stream";

                if (string.IsNullOrWhiteSpace(accessToken))
                    throw new ArgumentException("Credential (access token) is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow subdomain is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");
                if (string.IsNullOrWhiteSpace(recordSysId))
                    throw new ArgumentException("Record Sys ID is required.");
                if (fileContent == null || fileContent.Length == 0)
                    throw new ArgumentException("FileContent is required and cannot be empty.");
                if (string.IsNullOrWhiteSpace(fileName))
                    throw new ArgumentException("File Name is required.");

                string baseUrl = $"https://{subdomain}.service-now.com";
                string attachmentEndpoint = $"{baseUrl}/api/now/attachment";

                using (var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) })
                {
                    // Bearer token auth
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    using (var form = new MultipartFormDataContent())
                    {
                        form.Add(new StringContent(tableName), "table_name");
                        form.Add(new StringContent(recordSysId), "table_sys_id");
                        form.Add(new StringContent(fileName), "file_name");

                        var fileContentStream = new ByteArrayContent(fileContent);
                        fileContentStream.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
                        form.Add(fileContentStream, "file", fileName);

                        HttpResponseMessage response = httpClient.PostAsync(attachmentEndpoint, form).GetAwaiter().GetResult();
                        string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                        Response.Set(context, responseContent);

                        if (response.IsSuccessStatusCode)
                        {
                            JObject jsonResponse = JObject.Parse(responseContent);
                            string attachmentId = jsonResponse["result"]?["sys_id"]?.ToString();
                            AttachmentSysId.Set(context, attachmentId);

                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, $"Attachment uploaded successfully. sys_id: {attachmentId}");
                        }
                        else
                        {
                            AttachmentSysId.Set(context, null);
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Failed to upload attachment. Status: {response.StatusCode}, Response: {responseContent}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                AttachmentSysId.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error uploading ServiceNow attachment: {ex.Message}");
            }
        }
    }
}
