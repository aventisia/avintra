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
    [DisplayName("Get ServiceNow Attachment")]
    [Description("Retrieves metadata for a ServiceNow attachment by sys_id using a stored credential (Bearer token). Optionally downloads the file content.")]
    public class GetServiceNowAttachmentActivity : BaseCodeActivity
    {
        #region Inputs
        [RequiredArgument]
        [DisplayName("Credential (Bearer Token)")]
        [Description("The ServiceNow access token (OAuth2 Bearer token).")]
        public InArgument<string> CredentialId { get; set; }

        [RequiredArgument]
        [DisplayName("Attachment ID")]
        [Description("The sys_id of the attachment to retrieve.")]
        public InArgument<string> AttachmentId { get; set; }

        [DisplayName("Download File Content")]
        [Description("If enabled, downloads the binary content of the attachment.")]
        [DefaultValue(false)]
        public InArgument<bool> DownloadFileContent { get; set; }

        [DisplayName("ServiceNow Subdomain")]
        [Description("The ServiceNow instance subdomain (e.g., 'dev12345')")]
        [RequiredArgument]
        public InArgument<string> Subdomain { get; set; }
        #endregion

        #region Outputs
        [DisplayName("API Response")]
        [Description("Raw JSON response from ServiceNow API (metadata about the attachment).")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("File Content (Byte Array)")]
        [Description("Binary content of the attachment (only if Download File Content is enabled).")]
        public OutArgument<byte[]> FileContent { get; set; }

        [DisplayName("File Name")]
        [Description("Name of the attachment file.")]
        public OutArgument<string> FileName { get; set; }

        [DisplayName("Content Type")]
        [Description("MIME type of the attachment.")]
        public OutArgument<string> ContentType { get; set; }

        [DisplayName("Size (Bytes)")]
        [Description("Size of the attachment in bytes.")]
        public OutArgument<long> SizeBytes { get; set; }

        [DisplayName("Created On")]
        [Description("Timestamp when the attachment was created.")]
        public OutArgument<DateTime> CreatedOn { get; set; }
        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string accessToken = CredentialId.Get(context);
                string attachmentId = AttachmentId.Get(context);
                bool downloadFileContent = DownloadFileContent.Get(context);
                string subdomain = Subdomain.Get(context);

                if (string.IsNullOrWhiteSpace(accessToken))
                    throw new ArgumentException("Credential (access token) is required.");
                if (string.IsNullOrWhiteSpace(attachmentId))
                    throw new ArgumentException("Attachment ID is required.");
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("ServiceNow subdomain is required.");

                string baseUrl = $"https://{subdomain}.service-now.com";

                using (var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) })
                {
                    // Apply Bearer token authentication
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Get attachment metadata
                    string metadataUri = $"{baseUrl}/api/now/attachment/{attachmentId}";
                    var metadataResponse = httpClient.GetAsync(metadataUri).GetAwaiter().GetResult();
                    string responseContent = metadataResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    Response.Set(context, responseContent);

                    if (!metadataResponse.IsSuccessStatusCode)
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to retrieve attachment. Status: {metadataResponse.StatusCode}, Response: {responseContent}");
                        return;
                    }

                    JObject result = JObject.Parse(responseContent)?["result"]?.ToObject<JObject>();
                    if (result == null)
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, "No attachment data returned.");
                        return;
                    }

                    string fileName = result["file_name"]?.ToString();
                    string contentType = result["content_type"]?.ToString();
                    long size = result["size_bytes"]?.Value<long>() ?? 0;
                    DateTime createdOn;

                    FileName.Set(context, fileName);
                    ContentType.Set(context, contentType);
                    SizeBytes.Set(context, size);

                    if (DateTime.TryParse(result["sys_created_on"]?.ToString(), out createdOn))
                        CreatedOn.Set(context, createdOn);

                    if (downloadFileContent)
                    {
                        string fileUri = $"{baseUrl}/api/now/attachment/{attachmentId}/file";
                        var fileResponse = httpClient.GetAsync(fileUri).GetAwaiter().GetResult();

                        if (fileResponse.IsSuccessStatusCode)
                        {
                            byte[] fileBytes = fileResponse.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult();
                            FileContent.Set(context, fileBytes);

                            IsSuccess.Set(context, true);
                            StatusMessage.Set(context, $"Attachment downloaded successfully: {fileName} ({size} bytes)");
                        }
                        else
                        {
                            IsSuccess.Set(context, false);
                            StatusMessage.Set(context, $"Metadata retrieved, but failed to download file. Status: {fileResponse.StatusCode}");
                        }
                    }
                    else
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Attachment metadata retrieved successfully: {fileName} ({size} bytes)");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                FileContent.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving ServiceNow attachment: {ex.Message}");
            }
        }
    }
}
