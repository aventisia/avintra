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
    [DisplayName("Get Many AWS ELB Load Balancers")]
    [Description("Retrieves multiple load balancers from AWS Elastic Load Balancing (ALB/NLB).")]
    public class GetManyLoadBalancersActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all load balancers (up to AWS limit). Otherwise, limits results by 'Limit'.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of load balancers to return (max 100). Default: 100.")]
        [DefaultValue(100)]
        [RenderIfCondition(nameof(ReturnAll), false)]
        public InArgument<int> Limit { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the load balancers are located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Load Balancers")]
        [Description("List of retrieved load balancers (ARN, DNS name, state, etc.).")]
        public OutArgument<string> LoadBalancers { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS ELB.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (limit < 1 || limit > 100)
                    throw new ArgumentException("Limit must be between 1 and 100.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonElasticLoadBalancingV2Client(awsCreds, regionEndpoint))
                {
                    var request = new DescribeLoadBalancersRequest();
                    var allLoadBalancers = new List<LoadBalancer>();

                    // Call API (no pagination control in older SDKs)
                    var response = client.DescribeLoadBalancersAsync(request).GetAwaiter().GetResult();
                    allLoadBalancers.AddRange(response.LoadBalancers);

                    // Apply limit if not returning all
                    if (!returnAll && allLoadBalancers.Count > limit)
                    {
                        allLoadBalancers = allLoadBalancers.Take(limit).ToList();
                    }

                    // Convert to JSON output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = $"Retrieved {allLoadBalancers.Count} load balancers.",
                        LoadBalancers = allLoadBalancers.Select(lb => new
                        {
                            LoadBalancerArn = lb.LoadBalancerArn,
                            DNSName = lb.DNSName,
                            State = lb.State.Code,
                            Scheme = lb.Scheme,
                            Type = lb.Type,
                            VpcId = lb.VpcId,
                            CreatedAt = lb.CreatedTime
                        }).ToList(),
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    LoadBalancers.Set(context, JsonConvert.SerializeObject(allLoadBalancers));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allLoadBalancers.Count} load balancers.");
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

                LoadBalancers.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve load balancers: {ex.Message}");
            }
        }
    }
}