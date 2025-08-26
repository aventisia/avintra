namespace AspNetToolkit.Utils
{
    using System;
    using System.Threading.Tasks;
    using Amazon;
    using Amazon.Runtime;
    using Amazon.SecretsManager;
    using Amazon.SecretsManager.Model;

    /// <summary>
    /// Utility class for accessing AWS Secrets Manager using explicit credentials.
    /// </summary>
    public static class AwsSecretsManagerUtil
    {
        /// <summary>
        /// Fetches a secret value from AWS Secrets Manager as a plain string.
        /// </summary>
        /// <param name="secretName">The name or ARN of the secret.</param>
        /// <param name="region">AWS region, e.g., "us-east-1".</param>
        /// <param name="accessKey">AWS access key ID.</param>
        /// <param name="secretKey">AWS secret access key.</param>
        /// <param name="sessionToken">Optional session token (for temporary credentials).</param>
        /// <returns>The secret value as a plain string.</returns>
        public static async Task<string> GetSecretAsync(
            string secretName,
            string region,
            string accessKey,
            string secretKey,
            string? sessionToken = null)
        {
            // Validate input: secret name must be provided
            if (string.IsNullOrWhiteSpace(secretName))
                throw new ArgumentException("Secret name must be provided.", nameof(secretName));

            // Validate input: region must be provided
            if (string.IsNullOrWhiteSpace(region))
                throw new ArgumentException("Region must be provided.", nameof(region));

            // Convert the string region into AWS SDK's RegionEndpoint
            var awsRegion = RegionEndpoint.GetBySystemName(region);

            // Create AWS credentials using helper method
            var credentials = CreateAwsCredentials(accessKey, secretKey, sessionToken);

            // Use the credentials and region to create the Secrets Manager client
            using var secretsManager = new AmazonSecretsManagerClient(credentials, awsRegion);

            try
            {
                // Build the request to get the secret by name or ARN
                var request = new GetSecretValueRequest
                {
                    SecretId = secretName
                };

                // Call AWS Secrets Manager asynchronously to fetch the secret value
                var response = await secretsManager.GetSecretValueAsync(request);

                // Check if the secret string is null or empty
                if (string.IsNullOrEmpty(response.SecretString))
                    throw new InvalidOperationException($"Secret '{secretName}' is empty or not found.");

                // Return the secret string (could be JSON or plain text)
                return response.SecretString;
            }
            catch (ResourceNotFoundException)
            {
                // Secret doesn't exist — throw a more meaningful exception
                throw new InvalidOperationException($"Secret '{secretName}' not found.");
            }
            catch (AmazonSecretsManagerException ex)
            {
                // Handle AWS-specific exceptions, wrap in a more general exception for consumers
                throw new InvalidOperationException("AWS Secrets Manager error occurred.", ex);
            }
        }

        /// <summary>
        /// Creates AWS credentials using access key, secret key, and optional session token.
        /// </summary>
        /// <param name="accessKey">AWS access key ID.</param>
        /// <param name="secretKey">AWS secret access key.</param>
        /// <param name="sessionToken">Optional session token (for temporary credentials).</param>
        /// <returns>An instance of <see cref="AWSCredentials"/>.</returns>
        private static AWSCredentials CreateAwsCredentials(string accessKey, string secretKey, string? sessionToken)
        {
            // If no session token is provided, return basic (long-term) credentials
            if (string.IsNullOrEmpty(sessionToken))
            {
                return new BasicAWSCredentials(accessKey, secretKey);
            }
            else
            {
                // Otherwise, return session (temporary) credentials
                return new SessionAWSCredentials(accessKey, secretKey, sessionToken);
            }
        }
    }
}
