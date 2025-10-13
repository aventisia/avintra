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
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Get Many AWS ELB Listener Certificates")]
    [Description("Retrieves all certificates associated with an AWS Elastic Load Balancer (ALB/NLB) listener.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class GetManyListenerCertificatesActivity : BaseCodeActivity
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

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all certificates (no pagination). Otherwise, limits results by 'Limit'.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of certificates to return (max 100). Default: 100.")]
        [DefaultValue(100)]
        [RenderIfCondition(nameof(ReturnAll), false)]
        public InArgument<int> Limit { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the load balancer is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Certificates")]
        [Description("List of certificates associated with the listener.")]
        public OutArgument<string> Certificates { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS ELB.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string listenerArn = ListenerArn.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(listenerArn))
                    throw new ArgumentException("Listener ARN is required.");

                if (limit < 1 || limit > 100)
                    throw new ArgumentException("Limit must be between 1 and 100.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonElasticLoadBalancingV2Client(awsCreds, regionEndpoint))
                {
                    var request = new DescribeListenerCertificatesRequest
                    {
                        ListenerArn = listenerArn
                        // ❌ No MaxResults — not supported
                    };

                    var response = client.DescribeListenerCertificatesAsync(request).GetAwaiter().GetResult();

                    var allCertificates = response.Certificates; // All returned at once

                    // Apply limit if not returning all
                    if (!returnAll && allCertificates.Count > limit)
                    {
                        allCertificates = allCertificates.Take(limit).ToList();
                    }

                    // Convert to JSON output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = $"Retrieved {allCertificates.Count} certificates.",
                        Certificates = allCertificates.Select(c => new
                        {
                            CertificateArn = c.CertificateArn,
                            IsDefault = c.IsDefault,

                        }).ToList(),
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Certificates.Set(context, JsonConvert.SerializeObject(allCertificates));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allCertificates.Count} certificates.");
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

                Certificates.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve listener certificates: {ex.Message}");
            }
        }
    }
}