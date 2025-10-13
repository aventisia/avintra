using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.AzureActivities
{
    [DisplayName("Download File from Blob Storage")]
    [Description("Downloads a file from an Azure Blob container to a specified local path.")]
    [ActivityMetaData(nodeImg:"/assets/Azure.svg")]
    public class DownloadFileFromBlobStorageActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Blob Container Client")]
        [Description("The BlobContainerClient instance used to download the blob.")]
        public InArgument<BlobContainerClient> BlobContainerClient { get; set; }

        [RequiredArgument]
        [DisplayName("Blob Name")]
        [Description("The name of the blob/file in the container to be downloaded.")]
        public InArgument<string> BlobName { get; set; }

        [RequiredArgument]
        [DisplayName("Save Location")]
        [Description("The full path to the local folder where the file will be saved.")]
        public InArgument<string> SaveLocation { get; set; }

        // Output Arguments
        [DisplayName("Downloaded File Path")]
        [Description("The full local path to the downloaded file.")]
        public OutArgument<string> DownloadedFilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string downloadedFilePath = null;

            try
            {
                // Retrieve inputs
                var containerClient = BlobContainerClient.Get(context);
                string blobName = BlobName.Get(context);
                string saveLocation = SaveLocation.Get(context);

                // Validate inputs
                if (containerClient == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "BlobContainerClient is null.");
                    DownloadedFilePath.Set(context, null);
                    return;
                }

                if (string.IsNullOrWhiteSpace(blobName))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Blob name is null or empty.");
                    DownloadedFilePath.Set(context, null);
                    return;
                }

                if (string.IsNullOrWhiteSpace(saveLocation) || !Directory.Exists(saveLocation))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Invalid save location: '{saveLocation}'.");
                    DownloadedFilePath.Set(context, null);
                    return;
                }

                // Get blob client and download
                var blobClient = containerClient.GetBlobClient(blobName);
                downloadedFilePath = Path.Combine(saveLocation, blobName);

                blobClient.DownloadTo(downloadedFilePath);

                // Set outputs
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully downloaded '{blobName}' to '{downloadedFilePath}'.");
                DownloadedFilePath.Set(context, downloadedFilePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error downloading file from blob storage: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error downloading file from blob storage: {ex.Message}");
                DownloadedFilePath.Set(context, null);
            }
        }
    }
}