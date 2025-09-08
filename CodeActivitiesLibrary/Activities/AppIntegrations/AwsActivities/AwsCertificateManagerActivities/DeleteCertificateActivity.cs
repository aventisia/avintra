using Amazon;
using Amazon.CertificateManager;
using Amazon.CertificateManager.Model;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Delete AWS ACM Certificate")]
    [Description("Deletes an AWS Certificate Manager (ACM) certificate using AWS credentials resolved from environment or IAM role.")]
    public class DeleteCertificateActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Certificate ARN")]
        [Description("The ARN of the ACM certificate to delete (e.g., arn:aws:acm:us-east-1:123456789012:certificate/...).")]
        public InArgument<string> CertificateArn { get; set; }

        [DisplayName("Bucket Name")]
        [Description("S3 bucket name where the certificate was imported (only required for imported certificates).")]
        public InArgument<string> BucketName { get; set; }

        [DisplayName("Certificate Key")]
        [Description("Key of the certificate in S3 (only required for imported certificates).")]
        public InArgument<string> CertificateKey { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("JSON result containing success or error details")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Deletion Status")]
        [Description("Success or Failed")]
        public OutArgument<string> DeletionStatus { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialId = AWSServiceVaultId.Get(context); // For UI only
                string certificateArn = CertificateArn.Get(context);
                string bucketName = BucketName.Get(context);
                string certificateKey = CertificateKey.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(certificateArn))
                    throw new ArgumentException("Certificate ARN is required.");

                if (!certificateArn.StartsWith("arn:aws:acm:", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("Invalid Certificate ARN. Must start with 'arn:aws:acm:'.");

                var regionEndpoint = RegionEndpoint.GetBySystemName("us-east-1"); // Default region
                if (regionEndpoint == null)
                    throw new ArgumentException("Invalid AWS region.");

                // Use default AWS credential chain (env vars, IAM role, etc.)
                using (var client = new AmazonCertificateManagerClient(regionEndpoint))
                {
                    // Check if this is an imported certificate (has S3 info)
                    bool isImported = !string.IsNullOrEmpty(bucketName) && !string.IsNullOrEmpty(certificateKey);

                    if (isImported)
                    {
                        StatusMessage.Set(context, "Warning: Cannot delete imported certificates via ACM. Use S3 instead.");
                        IsSuccess.Set(context, false);
                        Response.Set(context, JsonConvert.SerializeObject(new { Success = false, Message = "Cannot delete imported certificates. Use S3." }));
                        DeletionStatus.Set(context, "Failed");
                        return;
                    }

                    // Call ACM API to delete certificate
                    var request = new DeleteCertificateRequest
                    {
                        CertificateArn = certificateArn
                    };

                    var response = client.DeleteCertificateAsync(request).GetAwaiter().GetResult();

                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Certificate deletion request submitted successfully.",
                        CertificateArn = certificateArn,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Response.Set(context, jsonResponse);
                    DeletionStatus.Set(context, "Success");
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Deletion initiated for certificate: {certificateArn}");
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
                DeletionStatus.Set(context, "Failed");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to delete ACM certificate: {ex.Message}");
            }
        }
    }
}