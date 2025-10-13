using CodeActivitiesLibrary.Extensions;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.AppIntegrations.GoogleWorkspaceActivities
{
    [DisplayName("Create Google Sheets Service Instance")]
    [Description("Creates and returns a SheetsService instance using Google service account credentials.")]
    [ActivityMetaData(nodeImg:"/assets/GoogleWorkspace.svg")]
  
    public class CreateGoogleInstanceActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Run Delay (ms)")]
        [Description("Delay in milliseconds before creating the Google Sheets instance. Helps avoid rate-limiting issues.")]
        public InArgument<int> RunDelay { get; set; }

        [RequiredArgument]
        [DisplayName("Account Type")]
        [Description("The type of the service account (typically 'service_account').")]
        public InArgument<string> AccountType { get; set; }

        [RequiredArgument]
        [DisplayName("Project ID")]
        [Description("The project ID associated with the Google Cloud Platform service account.")]
        public InArgument<string> ProjectId { get; set; }

        [RequiredArgument]
        [DisplayName("Private Key ID")]
        [Description("The private key ID from the Google service account JSON file.")]
        public InArgument<string> PrivateKeyId { get; set; }

        [RequiredArgument]
        [DisplayName("Private Key")]
        [Description("The private key from the Google service account JSON file. Must include escape characters (e.g., \\n).")]
        public InArgument<string> PrivateKey { get; set; }

        [RequiredArgument]
        [DisplayName("Client Email")]
        [Description("The email address of the Google service account.")]
        public InArgument<string> ClientEmail { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The client ID of the Google service account.")]
        public InArgument<string> ClientId { get; set; }

        // Output Arguments
        [DisplayName("Sheets Service")]
        [Description("The SheetsService instance for interacting with Google Sheets API.")]
        public OutArgument<SheetsService> SheetsService { get; set; }

        // Constants
        private const string ApplicationName = "Automation BOT";

        // Scopes (defined as static to avoid magic strings)
        private static readonly string[] Scopes = { Google.Apis.Sheets.v4.SheetsService.Scope.Spreadsheets };

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                int runDelay = RunDelay.Get(context);
                string accountType = AccountType.Get(context);
                string projectId = ProjectId.Get(context);
                string privateKeyId = PrivateKeyId.Get(context);
                string privateKey = PrivateKey.Get(context);
                string clientEmail = ClientEmail.Get(context);
                string clientId = ClientId.Get(context);

                // Apply delay
                if (runDelay > 0)
                    Thread.Sleep(runDelay);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(accountType))
                {
                    SetError(context, "Account Type is null or empty.");
                    return;
                }
                if (string.IsNullOrWhiteSpace(projectId))
                {
                    SetError(context, "Project ID is null or empty.");
                    return;
                }
                if (string.IsNullOrWhiteSpace(privateKeyId))
                {
                    SetError(context, "Private Key ID is null or empty.");
                    return;
                }
                if (string.IsNullOrWhiteSpace(privateKey))
                {
                    SetError(context, "Private Key is null or empty.");
                    return;
                }
                if (string.IsNullOrWhiteSpace(clientEmail))
                {
                    SetError(context, "Client Email is null or empty.");
                    return;
                }
                if (string.IsNullOrWhiteSpace(clientId))
                {
                    SetError(context, "Client ID is null or empty.");
                    return;
                }

                // Create credential from parameters
                var credential = GoogleCredential.FromJsonParameters(new JsonCredentialParameters
                {
                    Type = accountType,
                    ProjectId = projectId,
                    PrivateKeyId = privateKeyId,
                    PrivateKey = privateKey,
                    ClientEmail = clientEmail,
                    ClientId = clientId
                }).CreateScoped(Scopes);

                // Initialize Sheets Service
                var sheetsService = new SheetsService(new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName
                });

                // Success
                SheetsService.Set(context, sheetsService);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully created Google Sheets service instance.");
            }
            catch (Exception ex)
            {
                // Log full exception (including stack trace)
                Console.WriteLine($"Error creating SheetsService: {ex}");

                // Set outputs
                SheetsService.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating SheetsService: {ex.Message}");
            }
        }

        private void SetError(CodeActivityContext context, string errorMessage)
        {
            SheetsService.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, errorMessage);
        }
    }
}