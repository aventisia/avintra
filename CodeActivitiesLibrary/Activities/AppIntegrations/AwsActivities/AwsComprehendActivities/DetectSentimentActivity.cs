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

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Detect Sentiment (AWS Comprehend)")]
    [Description("Analyzes the sentiment of a given text using AWS Comprehend.")]
    public class DetectSentimentActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Language Code")]
        [Description("The language of the input text (e.g., en, es, fr).")]
        public InArgument<LanguageCode> LanguageCode { get; set; }

        [RequiredArgument]
        [DisplayName("Text")]
        [Description("The text to analyze for sentiment.")]
        public InArgument<string> Text { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the Comprehend service is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Sentiment")]
        [Description("The detected sentiment: POSITIVE, NEGATIVE, NEUTRAL, or MIXED.")]
        public OutArgument<string> Sentiment { get; set; }

        [DisplayName("Confidence Score")]
        [Description("Confidence score (0–1) for the detected sentiment.")]
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
                LanguageCode langCode = LanguageCode.Get(context);
                string text = Text.Get(context);
                string regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(text))
                    throw new ArgumentException("Text is required.");

                if (text.Length > 5000)
                    throw new ArgumentException("Text must be less than 5000 characters.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonComprehendClient(awsCreds, regionEndpoint))
                {
                    var request = new DetectSentimentRequest
                    {
                        Text = text,
                        LanguageCode = GetAwsLanguageCode(langCode)
                    };

                    var response = client.DetectSentimentAsync(request).GetAwaiter().GetResult();

                    // Extract sentiment
                    var sentiment = response.Sentiment.ToString(); // e.g., "POSITIVE"
                    double? confidence = response.SentimentScore?.Positive ??
                                       response.SentimentScore?.Negative ??
                                       response.SentimentScore?.Neutral ??
                                       response.SentimentScore?.Mixed ?? 0.0;

                    // Output
                    Sentiment.Set(context, sentiment);
                    ConfidenceScore.Set(context, confidence);
                    Response.Set(context, JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Sentiment detected successfully.",
                        Sentiment = sentiment,
                        Confidence = confidence,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented));

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Detected sentiment: {sentiment} (confidence: {confidence:F2})");
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

                Sentiment.Set(context, null);
                ConfidenceScore.Set(context, null);
                Response.Set(context, errorResponse);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to detect sentiment: {ex.Message}");
            }
        }

        // Helper: Map LanguageCode (ConstantClass) to AWS language code string
        private string GetAwsLanguageCode(LanguageCode langCode)
        {
            return langCode?.Value ?? "en";
        }
    }
}