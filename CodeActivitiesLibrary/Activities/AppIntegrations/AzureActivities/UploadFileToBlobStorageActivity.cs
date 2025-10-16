using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.AzureActivities
{
    [DisplayName("Upload File to Blob Storage")]
    [Description("Uploads a file from the local system to an Azure Blob container.")]
     [ActivityMetaData(nodeImg:"/assets/Azure.svg")]

    public class UploadFileToBlobStorageActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Blob Container Client")]
        [Description("The BlobContainerClient instance used to upload the blob.")]
        public InArgument<BlobContainerClient> BlobContainerClient { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the file to be uploaded to the blob container.")]
        public InArgument<string> FilePath { get; set; }

        // Output Arguments
        [DisplayName("Blob URL")]
        [Description("The URL of the uploaded blob.")]
        public OutArgument<string> BlobUrl { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                var containerClient = BlobContainerClient.Get(context);
                string filePath = FilePath.Get(context);

                // Validate inputs
                if (containerClient == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "BlobContainerClient is null.");
                    BlobUrl.Set(context, null); // No URL on failure
                    return;
                }

                if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"File not found: {filePath}");
                    BlobUrl.Set(context, null);
                    return;
                }

                // Extract file name for blob name
                string fileName = Path.GetFileName(filePath);

                // Upload file
                using (var fileStream = File.OpenRead(filePath))
                {
                    // This will throw if blob already exists; use conditional overload if needed
                    var response = containerClient.UploadBlob(fileName, fileStream);

                    // Set the blob URL as output
                    string blobUrl = $"{containerClient.Uri}/{fileName}";
                    BlobUrl.Set(context, blobUrl);

                    // Set success status
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully uploaded '{fileName}' to container '{containerClient.Name}'. Access URL: {blobUrl}");
                }
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Error uploading file to blob storage: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error uploading file to blob storage: {ex.Message}");
                BlobUrl.Set(context, null);
            }
        }
    }
}