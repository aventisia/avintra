using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.AzureActivities
{
    [DisplayName("Delete All Blobs from Container")]
    [Description("Deletes all blobs in the specified Azure Blob container. Returns the number of successfully deleted blobs.")]
    public class DeleteAllBlobsFromContainerActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Blob Container Client")]
        [Description("The BlobContainerClient instance used to access and delete all blobs in the container.")]
        public InArgument<BlobContainerClient> BlobContainerClient { get; set; }

        // Output Arguments
        [DisplayName("Blobs Deleted Count")]
        [Description("The number of blobs successfully deleted from the container.")]
        public OutArgument<int> BlobsDeletedCount { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            int deletedCount = 0;

            try
            {
                // Retrieve input
                var containerClient = BlobContainerClient.Get(context);

                // Validate input
                if (containerClient == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "BlobContainerClient is null.");
                    BlobsDeletedCount.Set(context, 0);
                    return;
                }

                // Get list of blobs
                var blobPages = containerClient.GetBlobs().AsPages();

                foreach (Azure.Page<BlobItem> page in blobPages)
                {
                    foreach (BlobItem blobItem in page.Values)
                    {
                        try
                        {
                            var blobClient = containerClient.GetBlobClient(blobItem.Name);
                            var response = blobClient.DeleteIfExists();

                            if (response.Value) // Only count if actually deleted
                            {
                                deletedCount++;
                            }
                        }
                        catch (Exception ex)
                        {
                            // Log individual blob failure but continue
                            Console.WriteLine($"Warning: Failed to delete blob '{blobItem.Name}': {ex.Message}");
                            // Don't set IsSuccess = false; just skip
                        }
                    }
                }

                // Set outputs
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully deleted {deletedCount} blob(s) from container '{containerClient.Name}'.");
                BlobsDeletedCount.Set(context, deletedCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error accessing or deleting blobs: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error accessing blob container: {ex.Message}");
                BlobsDeletedCount.Set(context, deletedCount); // Return partial count if any
            }
        }
    }
}