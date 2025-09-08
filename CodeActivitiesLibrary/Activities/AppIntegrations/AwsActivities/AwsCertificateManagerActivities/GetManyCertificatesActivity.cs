using Amazon;
using Amazon.CertificateManager;
using Amazon.CertificateManager.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Collections.Generic;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Get Many AWS Certificate Manager Certificates")]
    [Description("Lists multiple AWS Certificate Manager (ACM) certificates using the ListCertificates API.")]
    public class GetManyCertificatesActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("AWS Credential (Vault ID)")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all certificates (with pagination). Otherwise, limits results by 'Limit'.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of certificates to return (max 100). Default: 100.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), false)]
        public InArgument<int> Limit { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the certificates are located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Certificates")]
        [Description("List of certificate details (ARN, Domain, Status, CreatedAt, Type).")]
        public OutArgument<string> Certificates { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS Certificate Manager.")]
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

                if (!returnAll && (limit < 1 || limit > 100))
                    throw new ArgumentException("Limit must be between 1 and 100.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonCertificateManagerClient(awsCreds, regionEndpoint))
                {
                    var request = new ListCertificatesRequest
                    {
                        MaxItems = 100 // ACM max per page
                    };

                    var allCertificates = new List<CertificateSummary>();

                    do
                    {
                        var response = client.ListCertificatesAsync(request).GetAwaiter().GetResult();
                        allCertificates.AddRange(response.CertificateSummaryList);

                        if (string.IsNullOrEmpty(response.NextToken) || (!returnAll && allCertificates.Count >= limit))
                            break;

                        request.NextToken = response.NextToken;
                    } while (true);

                    if (!returnAll && allCertificates.Count > limit)
                        allCertificates = allCertificates.Take(limit).ToList();

                    // Only available fields in CertificateSummary
                    var certList = allCertificates.Select(c => new
                    {
                        CertificateArn = c.CertificateArn,
                        DomainName = c.DomainName,
                        Status = c.Status?.ToString(),
                        CreatedAt = c.CreatedAt,
                        Type = c.Type?.ToString()
                    }).ToList();

                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = $"Retrieved {certList.Count} certificates.",
                        Certificates = certList,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Certificates.Set(context, JsonConvert.SerializeObject(certList));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {certList.Count} certificates.");
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
                StatusMessage.Set(context, $"Failed to retrieve certificates: {ex.Message}");
            }
        }
    }
}
