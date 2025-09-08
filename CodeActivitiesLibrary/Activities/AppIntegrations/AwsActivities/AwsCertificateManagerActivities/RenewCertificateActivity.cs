using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using Amazon.CertificateManager;
using Amazon.CertificateManager.Model;
using Amazon;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Renew AWS ACM Certificate")]
    [Description("Renews an AWS Certificate Manager (ACM) certificate using AWS credentials from AWE Credential Vault.")]
    public class RenewAcmCertificateActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("AWS Credential (Vault ID)")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Certificate ARN")]
        [Description("The ARN of the ACM certificate to renew (e.g., arn:aws:acm:us-east-1:123456789012:certificate/...).")]
        public InArgument<string> CertificateArn { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the certificate is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("JSON result containing success or error details.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Renewal Status")]
        [Description("Success or Failed.")]
        public OutArgument<string> RenewalStatus { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string certificateArn = CertificateArn.Get(context);
                string region = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(certificateArn))
                    throw new ArgumentException("Certificate ARN is required.");
                if (!certificateArn.StartsWith("arn:aws:acm:", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Invalid Certificate ARN. Must start with 'arn:aws:acm:'.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(region);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonCertificateManagerClient(awsCreds, regionEndpoint))
                {
                    // Check if the certificate is private (only private CA certs can be renewed)
                    var describeResponse = client.DescribeCertificateAsync(new DescribeCertificateRequest
                    {
                        CertificateArn = certificateArn
                    }).GetAwaiter().GetResult();

                    if (describeResponse.Certificate.Type != CertificateType.PRIVATE)
                        throw new InvalidOperationException("Only private CA certificates can be manually renewed.");

                    // Renew the certificate
                    client.RenewCertificateAsync(new RenewCertificateRequest
                    {
                        CertificateArn = certificateArn
                    }).GetAwaiter().GetResult();

                    // Success response
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Renewal request submitted successfully.",
                        CertificateArn = certificateArn,
                        Region = region,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Response.Set(context, jsonResponse);
                    RenewalStatus.Set(context, "Success");
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Renewal initiated for certificate: {certificateArn}");
                }
            }
            catch (Exception ex)
            {
                string errorResponse = JsonConvert.SerializeObject(new
                {
                    Success = false,
                    Error = ex.Message,
                    InnerException = ex.InnerException?.Message,
                    Type = ex.GetType().Name
                }, Formatting.Indented);

                Response.Set(context, errorResponse);
                RenewalStatus.Set(context, "Failed");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to renew ACM certificate: {ex.Message}");
            }
        }
    }

}
