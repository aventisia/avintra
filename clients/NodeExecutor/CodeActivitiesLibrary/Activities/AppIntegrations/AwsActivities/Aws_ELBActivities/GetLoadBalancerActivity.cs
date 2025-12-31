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
    [DisplayName("Get AWS ELB Load Balancer")]
    [Description("Retrieves details of an Application or Network Load Balancer in AWS Elastic Load Balancing (ALB/NLB).")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class GetLoadBalancerActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Load Balancer ARN")]
        [Description("The ARN of the load balancer to retrieve.")]
        public InArgument<string> LoadBalancerArn { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the load balancer is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Load Balancer Details")]
        [Description("Details of the retrieved load balancer (ARN, DNS name, state, etc.).")]
        public OutArgument<string> LoadBalancerDetails { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS ELB.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string loadBalancerArn = LoadBalancerArn.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(loadBalancerArn))
                    throw new ArgumentException("Load Balancer ARN is required.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonElasticLoadBalancingV2Client(awsCreds, regionEndpoint))
                {
                    // Step 1: Describe Load Balancer
                    var describeRequest = new DescribeLoadBalancersRequest
                    {
                        LoadBalancerArns = new List<string> { loadBalancerArn }
                    };

                    var describeResponse = client.DescribeLoadBalancersAsync(describeRequest).GetAwaiter().GetResult();

                    if (describeResponse.LoadBalancers == null || describeResponse.LoadBalancers.Count == 0)
                    {
                        throw new InvalidOperationException($"Load balancer not found: {loadBalancerArn}");
                    }

                    var lb = describeResponse.LoadBalancers[0];

                    // Step 2: Get Tags
                    List<Amazon.ElasticLoadBalancingV2.Model.Tag> tags = null;
                    try
                    {
                        var tagsRequest = new DescribeTagsRequest
                        {
                            ResourceArns = new List<string> { loadBalancerArn }
                        };

                        var tagsResponse = client.DescribeTagsAsync(tagsRequest).GetAwaiter().GetResult();
                        tags = tagsResponse.TagDescriptions.FirstOrDefault()?.Tags;
                    }
                    catch
                    {
                        tags = new List<Amazon.ElasticLoadBalancingV2.Model.Tag>();
                    }

                    // Extract details
                    var details = new
                    {
                        LoadBalancerArn = lb.LoadBalancerArn,
                        DNSName = lb.DNSName,
                        State = lb.State.Code,
                        Scheme = lb.Scheme,
                        Type = lb.Type,
                        VpcId = lb.VpcId,
                        CreatedAt = lb.CreatedTime,
                        AvailabilityZones = lb.AvailabilityZones.Select(z => new
                        {
                            ZoneName = z.ZoneName,
                            SubnetId = z.SubnetId,
                            LoadBalancerAddresses = z.LoadBalancerAddresses?.Select(addr => addr.IpAddress).ToList()
                        }).ToList(),
                        SecurityGroups = lb.SecurityGroups,
                        Subnets = lb.AvailabilityZones.Select(z => z.SubnetId).ToList(),
                        Tags = tags?.Select(t => new { t.Key, t.Value }).ToList()
                    };

                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Load balancer retrieved successfully.",
                        LoadBalancerDetails = details,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    LoadBalancerDetails.Set(context, JsonConvert.SerializeObject(details));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved load balancer: {lb.DNSName}");
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

                LoadBalancerDetails.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve load balancer: {ex.Message}");
            }
        }
    }
}