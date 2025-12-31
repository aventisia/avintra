using Amazon;
using Amazon.ElasticLoadBalancingV2;
using Amazon.ElasticLoadBalancingV2.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Remove AWS ELB Listener Certificate")]
    [Description("Removes a certificate from an AWS Elastic Load Balancer (ALB/NLB) listener.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class RemoveListenerCertificateActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Listener ARN")]
        [Description("The ARN of the listener (e.g., arn:aws:elasticloadbalancing:...:listener/...).")]
        public InArgument<string> ListenerArn { get; set; }

        [RequiredArgument]
        [DisplayName("Certificate ARN")]
        [Description("The ARN of the ACM certificate to remove from the listener.")]
        public InArgument<string> CertificateArn { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the load balancer is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS ELB.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Success")]
        [Description("Indicates whether the operation was successful.")]
        public OutArgument<bool> Success { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string listenerArn = ListenerArn.Get(context);
                string certificateArn = CertificateArn.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(listenerArn))
                    throw new ArgumentException("Listener ARN is required.");

                if (string.IsNullOrWhiteSpace(certificateArn))
                    throw new ArgumentException("Certificate ARN is required.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonElasticLoadBalancingV2Client(awsCreds, regionEndpoint))
                {
                    var request = new RemoveListenerCertificatesRequest
                    {
                        ListenerArn = listenerArn,
                        Certificates = new List<Amazon.ElasticLoadBalancingV2.Model.Certificate>
                        {
                            new Amazon.ElasticLoadBalancingV2.Model.Certificate
                            {
                                CertificateArn = certificateArn
                            }
                        }
                    };

                    var response = client.RemoveListenerCertificatesAsync(request).GetAwaiter().GetResult();

                    // Output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Certificate removed from listener successfully.",
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Response.Set(context, jsonResponse);
                    Success.Set(context, true);
                    StatusMessage.Set(context, $"Removed certificate {certificateArn} from listener {listenerArn}");
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
                Success.Set(context, false);
                StatusMessage.Set(context, $"Failed to remove certificate from listener: {ex.Message}");
            }
        }
    }
}