using Azure.Storage.Blobs;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.AzureActivities
{
    [DisplayName("Get Blob Container Client Instance")]
    [Description("Creates and returns a BlobContainerClient instance for the specified container and connection string.")]

    public class GetBlobContainerClientInstanceActivity : BaseCodeActivity
    {
        // Input Arguments

        [RequiredArgument]
        [DisplayName("Connection String")]
        [Description("The connection string for the Azure Blob Storage account.")]
        public InArgument<string> ConnectionString { get; set; }

        [RequiredArgument]
        [DisplayName("Container Name")]
        [Description("The name of the container in the storage account.")]
        public InArgument<string> ContainerName { get; set; }

        // Output Arguments

        [DisplayName("Blob Container Client")]
        [Description("The BlobContainerClient instance for the specified container and connection string.")]
        public OutArgument<BlobContainerClient> BlobContainerClient { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                string connectionString = ConnectionString.Get(context);
                string containerName = ContainerName.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Connection string is null or empty.");
                    BlobContainerClient.Set(context, null);
                    return;
                }

                if (string.IsNullOrWhiteSpace(containerName))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Container name is null or empty.");
                    BlobContainerClient.Set(context, null);
                    return;
                }

                // Create client
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                // Set outputs
                BlobContainerClient.Set(context, containerClient);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully created BlobContainerClient for container '{containerName}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating BlobContainerClient: {ex.Message}");
                BlobContainerClient.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating BlobContainerClient: {ex.Message}");
            }
        }
    }
}