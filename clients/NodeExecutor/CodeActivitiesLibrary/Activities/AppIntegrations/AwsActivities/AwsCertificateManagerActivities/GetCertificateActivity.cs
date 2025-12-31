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
    [DisplayName("Get AWS Certificate Manager Certificate")]
    [Description("Retrieves the certificate body and chain from AWS Certificate Manager using the Certificate ARN.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class GetCertificateActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("AWS Credential (Vault ID)")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Certificate ARN")]
        [Description("The ARN of the AWS Certificate Manager certificate to retrieve (e.g., arn:aws:acm:us-east-1:123456789012:certificate/...).")]
        public InArgument<string> CertificateArn { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the certificate is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Certificate Body")]
        [Description("The PEM-encoded certificate body.")]
        public OutArgument<string> CertificateBody { get; set; }

        [DisplayName("Certificate Chain")]
        [Description("The PEM-encoded certificate chain (intermediate CAs).")]
        public OutArgument<string> CertificateChain { get; set; }

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

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonCertificateManagerClient(awsCreds, regionEndpoint))
                {
                    var request = new GetCertificateRequest
                    {
                        CertificateArn = certificateArn
                    };

                    var response = client.GetCertificateAsync(request).GetAwaiter().GetResult();

                    // Set outputs
                    CertificateBody.Set(context, response.Certificate);
                    CertificateChain.Set(context, response.CertificateChain ?? "");

                    // Optional: JSON response
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Certificate retrieved successfully.",
                        CertificateArn = certificateArn,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved certificate: {certificateArn}");
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
                CertificateBody.Set(context, null);
                CertificateChain.Set(context, null);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve AWS Certificate Manager certificate: {ex.Message}");
            }
        }
    }
}
