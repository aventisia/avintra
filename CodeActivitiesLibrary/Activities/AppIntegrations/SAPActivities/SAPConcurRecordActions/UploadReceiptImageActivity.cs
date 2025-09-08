using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Upload Receipt Image")]
    [Description("Uploads receipt files to SAP Concur, supporting formats like PDF, JPG, JPEG, and PNG.")]
    public class UploadReceiptImageActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP Concur App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP Concur App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., expense.attachment.write).")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("File Bytes")]
        [Description("Byte array of the receipt file.")]
        public InArgument<byte[]> FileBytes { get; set; }

        [RequiredArgument]
        [DisplayName("File Name")]
        [Description("Name of the file (e.g., receipt.jpg).")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Content Type")]
        [Description("MIME type of the file (e.g., image/jpeg, application/pdf).")]
        public InArgument<string> ContentType { get; set; } = "image/jpeg";

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Response")]
        [Description("Response from SAP Concur API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var fileBytes = FileBytes.Get(context);
                var fileName = FileName.Get(context);
                var contentType = ContentType.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (fileBytes == null || fileBytes.Length == 0)
                    throw new ArgumentException("File Bytes cannot be null or empty.");
                if (string.IsNullOrWhiteSpace(fileName))
                    throw new ArgumentException("File Name is required.");

                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                var (response, statusCode) = UploadFile(token, fileBytes, fileName, contentType);

                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode == 201);
                StatusMessage.Set(context, statusCode == 201
                    ? "Receipt uploaded successfully."
                    : $"Failed to upload receipt. Status: {statusCode}");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error uploading receipt image: {ex.Message}";
                Response.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private (string response, int statusCode) UploadFile(string token, byte[] fileBytes, string fileName, string contentType)
        {
            var apiUrl = "https://us.api.concursolutions.com/expense/v4.0/attachments";
            var client = new HttpClient();

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var formData = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            formData.Add(fileContent, "file", fileName);

            var response = client.PostAsync(apiUrl, formData).Result;
            var responseText = response.Content.ReadAsStringAsync().Result;
            return (responseText, (int)response.StatusCode);
        }
    }
}