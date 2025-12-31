using Azure.Storage.Blobs;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.AzureActivities
{
    [DisplayName("Delete Blob from Container")]
    [Description("Deletes a specified blob from the Azure Blob container.")]
    [ActivityMetaData(nodeImg:"/assets/Azure.svg")]
    public class DeleteBlobFromContainerActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Blob Container Client")]
        [Description("The BlobContainerClient instance used to access the blob container.")]
        public InArgument<BlobContainerClient> BlobContainerClient { get; set; }

        [RequiredArgument]
        [DisplayName("Blob Name")]
        [Description("The name of the blob to delete from the container.")]
        public InArgument<string> BlobName { get; set; }

        // Output Arguments
        [DisplayName("Blob Was Deleted")]
        [Description("True if the blob was found and successfully deleted; false if it did not exist or deletion failed.")]
        public OutArgument<bool> BlobWasDeleted { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            bool wasDeleted = false; // Default: assume not deleted

            try
            {
                // Retrieve inputs
                var containerClient = BlobContainerClient.Get(context);
                string blobName = BlobName.Get(context);

                // Validate inputs
                if (containerClient == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "BlobContainerClient is null.");
                    BlobWasDeleted.Set(context, false);
                    return;
                }

                if (string.IsNullOrWhiteSpace(blobName))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Blob name is null or empty.");
                    BlobWasDeleted.Set(context, false);
                    return;
                }

                // Get blob client
                var blobClient = containerClient.GetBlobClient(blobName);

                // Use DeleteIfExists to safely handle "not found" case
                var response = blobClient.DeleteIfExists();

                wasDeleted = response.Value; // true = deleted, false = not found

                // Set activity outputs
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, wasDeleted
                    ? $"Successfully deleted blob '{blobName}'."
                    : $"Blob '{blobName}' does not exist or was already deleted.");
            }
            catch (Exception ex)
            {
                // Only hit if there's a real error (e.g. auth, network, etc.)
                Console.WriteLine($"Error deleting blob: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting blob: {ex.Message}");
                wasDeleted = false; // Definitely not deleted
            }
            finally
            {
                // Always set the output
                BlobWasDeleted.Set(context, wasDeleted);
                IsSuccess.Set(context, true);
            }
        }
    }
}