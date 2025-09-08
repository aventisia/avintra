using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper
{
    // Helper class for fetching AWS credentials from AWE Vault
    public static class AwsCredentialManager
    {
        public static AWSCredentials GetCredentials(string vaultId)
        {
            // Replace with your actual vault retrieval logic
            string accessKey = VaultHelper.GetSecret(vaultId, "AWSAccessKeyId");
            string secretKey = VaultHelper.GetSecret(vaultId, "AWSSecretAccessKey");

            if (string.IsNullOrWhiteSpace(accessKey) || string.IsNullOrWhiteSpace(secretKey))
                throw new InvalidOperationException($"Invalid credentials for Vault ID: {vaultId}");

            return new BasicAWSCredentials(accessKey, secretKey);
        }
    }
}
