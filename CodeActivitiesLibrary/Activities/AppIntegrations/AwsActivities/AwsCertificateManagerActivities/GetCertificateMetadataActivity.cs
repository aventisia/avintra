using Amazon;
using Amazon.CertificateManager;
using Amazon.CertificateManager.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Get AWS Certificate Manager Certificate Metadata")]
    [Description("Retrieves metadata for an AWS Certificate Manager (ACM) certificate using the DescribeCertificate API.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class GetCertificateMetadataActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Certificate ARN")]
        [Description("The ARN of the AWS Certificate Manager certificate to retrieve metadata for (e.g., arn:aws:acm:us-east-1:123456789012:certificate/...).")]
        public InArgument<string> CertificateArn { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the certificate is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Certificate Metadata")]
        [Description("Structured metadata about the certificate (domain, status, expiration, etc.).")]
        public OutArgument<string> Metadata { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS Certificate Manager.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string certificateArn = CertificateArn.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(certificateArn))
                    throw new ArgumentException("Certificate ARN is required.");
                if (!certificateArn.StartsWith("arn:aws:acm:", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Invalid Certificate ARN. Must start with 'arn:aws:acm:'.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonCertificateManagerClient(awsCreds, regionEndpoint))
                {
                    var request = new DescribeCertificateRequest
                    {
                        CertificateArn = certificateArn
                    };

                    var response = client.DescribeCertificateAsync(request).GetAwaiter().GetResult();
                    var certificate = response.Certificate;

                    // Get tags separately (if needed)
                    var tagsResponse = client.ListTagsForCertificateAsync(new ListTagsForCertificateRequest
                    {
                        CertificateArn = certificateArn
                    }).GetAwaiter().GetResult();

                    var metadata = new
                    {
                        CertificateArn = certificate.CertificateArn,
                        DomainName = certificate.DomainName,
                        Status = certificate.Status?.ToString(),
                        NotBefore = certificate.NotBefore,
                        NotAfter = certificate.NotAfter,
                        KeyAlgorithm = certificate.KeyAlgorithm?.ToString(),
                        Issuer = certificate.Issuer,
                        CertificateType = certificate.Type?.ToString(),
                        RenewalEligibility = certificate.RenewalEligibility?.ToString(),
                        Options = certificate.Options != null ? new
                        {
                            CertificateTransparencyLoggingPreference = certificate.Options.CertificateTransparencyLoggingPreference?.ToString()
                        } : null,
                        Tags = tagsResponse.Tags?.Select(t => new { t.Key, t.Value }).ToList()
                    };

                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Certificate metadata retrieved successfully.",
                        Metadata = metadata,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Metadata.Set(context, JsonConvert.SerializeObject(metadata));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved metadata for certificate: {certificateArn}");
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

                Metadata.Set(context, null);
                Response.Set(context, errorResponse);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve certificate metadata: {ex.Message}");
            }
        }
    }
}
