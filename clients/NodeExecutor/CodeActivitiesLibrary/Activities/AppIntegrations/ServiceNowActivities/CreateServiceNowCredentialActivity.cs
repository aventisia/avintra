using CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{

    [DisplayName("Create ServiceNow Credential")]
    [Description("Creates a new ServiceNow credential using either Basic Auth or OAuth2.")]
    [ActivityMetaData(nodeImg:"/assets/ServiceNow.svg")]
    public class CreateServiceNowCredentialActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Connect Using")]
        [Description("Authentication method to use for connecting to ServiceNow")]
        public InArgument<ServiceNowAuthMethodEnum> ConnectUsing { get; set; }

        [DisplayName("User")]
        [Description("Username for Basic Auth")]
        [RequiredArgument]
        [RenderIfCondition(nameof(ConnectUsing), "BasicAuth")]
        public InArgument<string> User { get; set; }

        [DisplayName("Password")]
        [Description("Password for Basic Auth")]
        [RequiredArgument]
        [RenderIfCondition(nameof(ConnectUsing), "BasicAuth")]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("OAuth Redirect URL")]
        [Description("Redirect URL for OAuth2 flow (usually provided by the platform)")]
        [RequiredArgument]
        [RenderIfCondition(nameof(ConnectUsing), "OAuth2")]
        public InArgument<string> OAuthRedirectUrl { get; set; }

        [DisplayName("Client ID")]
        [Description("Client ID from ServiceNow OAuth2 application")]
        [RequiredArgument]
        [RenderIfCondition(nameof(ConnectUsing), "OAuth2")]
        public InArgument<string> ClientId { get; set; }

        [DisplayName("Client Secret")]
        [Description("Client Secret from ServiceNow OAuth2 application")]
        [RequiredArgument]
        [RenderIfCondition(nameof(ConnectUsing), "OAuth2")]
        public InArgument<string> ClientSecret { get; set; }

        [DisplayName("Subdomain")]
        [Description("Subdomain of your ServiceNow instance (e.g., dev99890 from https://dev99890.service-now.com)")]
        [RequiredArgument]
        public InArgument<string> Subdomain { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Credential ID")]
        [Description("Unique identifier for the created credential")]
        public OutArgument<string> CredentialId { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var connectUsing = ConnectUsing.Get(context);
                string user = User?.Get(context);
                string password = ConvertSecureStringToString(Password?.Get(context));
                string oauthRedirectUrl = OAuthRedirectUrl?.Get(context);
                string clientId = ClientId?.Get(context);
                string clientSecret = ClientSecret?.Get(context);
                string subdomain = Subdomain.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(subdomain))
                    throw new ArgumentException("Subdomain is required.");

                if (connectUsing == ServiceNowAuthMethodEnum.BasicAuth)
                {
                    if (string.IsNullOrWhiteSpace(user))
                        throw new ArgumentException("User is required for Basic Auth.");
                    if (string.IsNullOrWhiteSpace(password))
                        throw new ArgumentException("Password is required for Basic Auth.");
                }
                else if (connectUsing == ServiceNowAuthMethodEnum.OAuth2)
                {
                    if (string.IsNullOrWhiteSpace(oauthRedirectUrl))
                        throw new ArgumentException("OAuth Redirect URL is required for OAuth2.");
                    if (string.IsNullOrWhiteSpace(clientId))
                        throw new ArgumentException("Client ID is required for OAuth2.");
                    if (string.IsNullOrWhiteSpace(clientSecret))
                        throw new ArgumentException("Client Secret is required for OAuth2.");
                }

                // Simulate saving credential (in real app, this would call a credential store API)
                string credentialId = Guid.NewGuid().ToString(); // Replace with actual credential creation logic

                // Store credential details securely (this is a simulation)
                // In practice, you'd save these to a secure vault or database
                var credentialData = new
                {
                    Method = connectUsing.ToString(),
                    Subdomain = subdomain,
                    User = user,
                    Password = password,
                    OAuthRedirectUrl = oauthRedirectUrl,
                    ClientId = clientId,
                    ClientSecret = clientSecret
                };

                // Example: Save to external vault or internal storage
                // SaveToSecureStore(credentialId, JsonConvert.SerializeObject(credentialData));

                CredentialId.Set(context, credentialId);
                StatusMessage.Set(context, $"ServiceNow credential created successfully using {connectUsing}.");

                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                CredentialId.Set(context, null);
                StatusMessage.Set(context, $"Error creating ServiceNow credential: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        // Optional: Helper method to simulate secure storage
        private void SaveToSecureStore(string credentialId, string jsonData)
        {
            // This would be replaced with actual secure storage logic
            // e.g., encrypt and save to database, key vault, etc.
            // For demo purposes, we're just logging
            Console.WriteLine($"Saving credential {credentialId}: {jsonData}");
        }
      
    }
}