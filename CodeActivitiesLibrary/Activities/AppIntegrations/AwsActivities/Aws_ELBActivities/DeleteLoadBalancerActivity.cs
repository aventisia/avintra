using Amazon;
using Amazon.ElasticLoadBalancingV2;
using Amazon.ElasticLoadBalancingV2.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Delete AWS ELB Load Balancer")]
    [Description("Deletes an Application or Network Load Balancer in AWS Elastic Load Balancing (ALB/NLB).")]
    public class DeleteLoadBalancerActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Load Balancer ARN")]
        [Description("The ARN of the load balancer to delete.")]
        public InArgument<string> LoadBalancerArn { get; set; }

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
                    var request = new DeleteLoadBalancerRequest
                    {
                        LoadBalancerArn = loadBalancerArn
                    };

                    var response = client.DeleteLoadBalancerAsync(request).GetAwaiter().GetResult();

                    // Output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Load balancer deleted successfully.",
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Response.Set(context, jsonResponse);
                    Success.Set(context, true);
                    StatusMessage.Set(context, $"Deleted load balancer: {loadBalancerArn}");
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
                StatusMessage.Set(context, $"Failed to delete load balancer: {ex.Message}");
            }
        }
    }
}