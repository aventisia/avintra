using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using Amazon.Comprehend;
using Amazon.Comprehend.Model;
using Amazon;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Detect Dominant Language (AWS Comprehend)")]
    [Description("Identifies the dominant language of a given text using AWS Comprehend.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class DetectDominantLanguageActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Text")]
        [Description("The text to analyze for dominant language.")]
        public InArgument<string> Text { get; set; }

        [DisplayName("Simplify")]
        [Description("If enabled, returns only the language code (e.g., 'en'). Otherwise, returns full response with confidence.")]
        [DefaultValue(false)]
        public InArgument<bool> Simplify { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the Comprehend service is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Detected Language")]
        [Description("The detected language code (e.g., 'en') or full result if Simplify is off.")]
        public OutArgument<string> DetectedLanguage { get; set; }

        [DisplayName("Confidence Score")]
        [Description("Confidence score (0–1) for the detected language.")]
        public OutArgument<double?> ConfidenceScore { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS Comprehend.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string text = Text.Get(context);
                bool simplify = Simplify.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(text))
                    throw new ArgumentException("Text is required.");

                if (text.Length > 2048)
                    throw new ArgumentException("Text must be less than 2048 characters.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonComprehendClient(awsCreds, regionEndpoint))
                {
                    var request = new DetectDominantLanguageRequest
                    {
                        Text = text
                    };

                    var response = client.DetectDominantLanguageAsync(request).GetAwaiter().GetResult();

                    // Extract results
                    var languageResults = response.Languages;
                    var topLanguage = languageResults?.FirstOrDefault();

                    string languageCode = topLanguage?.LanguageCode ?? "unknown";
                    double? confidence = topLanguage?.LanguageCode == null ? null : (double?)topLanguage.Score; // ✅ .Score, not .Confidence

                    // Output based on Simplify
                    string output = simplify
                        ? languageCode
                        : JsonConvert.SerializeObject(new
                        {
                            LanguageCode = languageCode,
                            Confidence = confidence
                        });

                    DetectedLanguage.Set(context, output);
                    ConfidenceScore.Set(context, confidence);
                    Response.Set(context, JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Dominant language detected successfully.",
                        DetectedLanguage = languageCode,
                        Confidence = confidence,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented));

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Detected language: {languageCode} (confidence: {confidence:F2})");
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

                DetectedLanguage.Set(context, null);
                ConfidenceScore.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to detect dominant language: {ex.Message}");
            }
        }
    }
}