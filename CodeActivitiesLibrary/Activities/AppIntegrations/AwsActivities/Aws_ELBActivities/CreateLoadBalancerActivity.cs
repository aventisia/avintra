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
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Create AWS ELB Load Balancer")]
    [Description("Creates an Application or Network Load Balancer in AWS Elastic Load Balancing (ALB/NLB).")]
    public class CreateLoadBalancerActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("IP Address Type")]
        [Description("The IP address type of the load balancer.")]
        public InArgument<IpAddressTypeEnum> IpAddressType { get; set; }

        [RequiredArgument]
        [DisplayName("Name")]
        [Description("The name of the load balancer.")]
        public InArgument<string> Name { get; set; }

        [RequiredArgument]
        [DisplayName("Schema")]
        [Description("Specifies whether the load balancer is internal or internet-facing.")]
        public InArgument<SchemaEnum> Schema { get; set; }

        [RequiredArgument]
        [DisplayName("Type")]
        [Description("The type of load balancer: Application or Network.")]
        public InArgument<TypeEnum> Type { get; set; }

        [RequiredArgument]
        [DisplayName("Subnet ID Names or IDs")]
        [Description("List of subnet IDs where the load balancer will be deployed.")]
        public InArgument<List<string>> SubnetIds { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Optional tags to attach to the load balancer (key-value pairs).")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the load balancer is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Load Balancer ARN")]
        [Description("The ARN of the created load balancer.")]
        public OutArgument<string> LoadBalancerArn { get; set; }

        [DisplayName("DNS Name")]
        [Description("The DNS name of the created load balancer.")]
        public OutArgument<string> DnsName { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS ELB.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                IpAddressTypeEnum ipAddressType = IpAddressType.Get(context);
                string name = Name.Get(context);
                SchemaEnum schema = Schema.Get(context);
                TypeEnum type = Type.Get(context);
                List<string> subnetIds = SubnetIds.Get(context);
                Dictionary<string, object> additionalFields = AdditionalFields.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Name is required.");

                if (name.Length < 1 || name.Length > 32)
                    throw new ArgumentException("Name must be between 1 and 32 characters.");

                if (subnetIds == null || subnetIds.Count == 0)
                    throw new ArgumentException("Subnet IDs are required.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonElasticLoadBalancingV2Client(awsCreds, regionEndpoint))
                {
                    var request = new CreateLoadBalancerRequest
                    {
                        Name = name,
                        Scheme = schema == SchemaEnum.Internal ? "internal" : "internet-facing",
                        Subnets = subnetIds,
                        IpAddressType = ipAddressType == IpAddressTypeEnum.Ipv6 ? "ipv6" : "ipv4",
                        Type = type == TypeEnum.Application ? "application" : "network"
                    };

                    // Add tags if AdditionalFields are provided
                    if (additionalFields != null && additionalFields.Count > 0)
                    {
                        request.Tags = new List<Tag>();
                        foreach (var kvp in additionalFields)
                        {
                            request.Tags.Add(new Tag
                            {
                                Key = kvp.Key,
                                Value = kvp.Value?.ToString()
                            });
                        }
                    }

                    var response = client.CreateLoadBalancerAsync(request).GetAwaiter().GetResult();

                    // Output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Load balancer created successfully.",
                        LoadBalancerArn = response.LoadBalancers[0].LoadBalancerArn,
                        DnsName = response.LoadBalancers[0].DNSName,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    LoadBalancerArn.Set(context, response.LoadBalancers[0].LoadBalancerArn);
                    DnsName.Set(context, response.LoadBalancers[0].DNSName);
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Created load balancer: {name}");
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

                LoadBalancerArn.Set(context, null);
                DnsName.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to create load balancer: {ex.Message}");
            }
        }
    }

    // Enum for IP Address Type
    public enum IpAddressTypeEnum
    {
        [Display(Name = "Ipv4")]
        [Description("Use IPv4 for the load balancer's IP addressing.")]
        Ipv4,

        [Display(Name = "Ipv6")]
        [Description("Use IPv6 for the load balancer's IP addressing.")]
        Ipv6
    }

    // Enum for Schema
    public enum SchemaEnum
    {
        [Display(Name = "Internal")]
        [Description("The load balancer is accessible only within the VPC.")]
        Internal,

        [Display(Name = "Internet-facing")]
        [Description("The load balancer is publicly accessible via the internet.")]
        InternetFacing
    }

    // Enum for Type
    public enum TypeEnum
    {
        [Display(Name = "Application")]
        [Description("Application Load Balancer (ALB) - operates at Layer 7 (HTTP/HTTPS).")]
        Application,

        [Display(Name = "Network")]
        [Description("Network Load Balancer (NLB) - operates at Layer 4 (TCP/TLS).")]
        Network
    }
}