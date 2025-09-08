using Amazon;
using Amazon.Comprehend;
using Amazon.Comprehend.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Detect Entities (AWS Comprehend)")]
    [Description("Identifies named entities (e.g., PERSON, ORGANIZATION, LOCATION) in a given text using AWS Comprehend.")]
    public class DetectEntitiesActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Language Code")]
        [Description("The language of the input text.")]
        public InArgument<LanguageCode> LanguageCode { get; set; }

        [RequiredArgument]
        [DisplayName("Text")]
        [Description("The text to analyze for named entities.")]
        public InArgument<string> Text { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the Comprehend service is located (default: us-east-1).")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Detected Entities")]
        [Description("List of detected entities.")]
        public OutArgument<string> Entities { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS Comprehend.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                LanguageCode langCode = LanguageCode.Get(context);
                string text = Text.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                if (string.IsNullOrWhiteSpace(text))
                    throw new ArgumentException("Text is required.");

                if (text.Length > 5000)
                    throw new ArgumentException("Text must be less than 5000 characters.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonComprehendClient(awsCreds, regionEndpoint))
                {
                    var request = new DetectEntitiesRequest
                    {
                        Text = text,
                        LanguageCode = GetAwsLanguageCode(langCode)
                    };

                    var response = client.DetectEntitiesAsync(request).GetAwaiter().GetResult();

                    var entityList = response.Entities.Select(e => new
                    {
                        Type = e.Type,
                        Text = e.Text,
                        Confidence = (double)e.Score,
                        BeginOffset = e.BeginOffset,
                        EndOffset = e.EndOffset
                    }).ToList();

                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Entities detected successfully.",
                        Entities = entityList,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Entities.Set(context, JsonConvert.SerializeObject(entityList));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Detected {entityList.Count} entities.");
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

                Entities.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to detect entities: {ex.Message}");
            }
        }
        // Helper: Map LanguageCode (ConstantClass) to AWS language code string
        private string GetAwsLanguageCode(LanguageCode langCode)
        {
            return langCode?.Value ?? "en";
        }
    }
}

