using CodeActivitiesLibrary.Extensions;
using Microsoft.Exchange.WebServices.Data;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.ExchangeServerActivities
{
    [DisplayName("Connect to Exchange Server")]
    [Description("Open a new connection to an Exchange server.")]
    [ActivityMetaData(nodeImg:"/assets/ExchangeServer.svg")]
    public class ConnectToExchangeServerActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Exchange Server Version")]
        [Description("The version of the Exchange server (e.g., Exchange 2013 SP1).")]
        public InArgument<ExchangeVersionEnum> ExchangeServerVersion { get; set; }

        [RequiredArgument]
        [DisplayName("Connection Type")]
        [Description("Specifies how to connect to the Exchange server.")]
        public InArgument<ConnectionTypeEnum> ConnectionType { get; set; }

        [DisplayName("Email Address")]
        [Description("The email address used for auto-discovery (required if 'Connection Type' is 'Auto discovery').")]
        [RenderIfCondition(nameof(ConnectionType), ConnectionTypeEnum.AutoDiscovery)]
        public InArgument<string> EmailAddress { get; set; }

        [DisplayName("Server Address")]
        [Description(
            "The direct URL or IP address of the Exchange server (required if 'Connection Type' is 'Exchange server address').")]
        [RenderIfCondition(nameof(ConnectionType), ConnectionTypeEnum.ExchangeServerAddress)]
        public InArgument<string> ServerAddress { get; set; }

        [DisplayName("Credentials")]
        [Description("Specifies the authentication method to use.")]
        public InArgument<CredentialsEnum> Credentials { get; set; }

        [DisplayName("Domain")]
        [Description("The domain name for user-defined credentials (required if 'Credentials' is 'User defined').")]
        [RenderIfCondition(nameof(Credentials), CredentialsEnum.UserDefined)]
        public InArgument<string> Domain { get; set; }

        [DisplayName("Username")]
        [Description("The username for user-defined credentials (required if 'Credentials' is 'User defined').")]
        [RenderIfCondition(nameof(Credentials), CredentialsEnum.UserDefined)]
        public InArgument<string> Username { get; set; }

        [DisplayName("Password")]
        [Description("The password for user-defined credentials (required if 'Credentials' is 'User defined').")]
        [RenderIfCondition(nameof(Credentials), CredentialsEnum.UserDefined)]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Timeout")]
        [Description("The timeout in seconds for the connection attempt.")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Exchange Connection")]
        [Description("The Exchange service object representing the connection to the Exchange server.")]
        public OutArgument<ExchangeService> ExchangeConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var exchangeVersion = ExchangeServerVersion.Get(context);
                var connectionType = ConnectionType.Get(context);
                var credentialsMode = Credentials.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var timeout = Timeout.Get(context);


                switch (connectionType)
                {
                    case ConnectionTypeEnum.AutoDiscovery:
                        if (string.IsNullOrWhiteSpace(EmailAddress.Get(context)))
                            throw new ArgumentException("Email address is required for auto-discovery.");
                        break;

                    case ConnectionTypeEnum.ExchangeServerAddress:
                        if (string.IsNullOrWhiteSpace(ServerAddress.Get(context)))
                            throw new ArgumentException("Server address is required for direct connection.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(connectionType));
                }

                switch (credentialsMode)
                {
                    case CredentialsEnum.ExchangeDefault:
                        break;

                    case CredentialsEnum.UserDefined:
                        if (string.IsNullOrWhiteSpace(Domain.Get(context)) ||
                            string.IsNullOrWhiteSpace(Username.Get(context)) ||
                            string.IsNullOrWhiteSpace(password))
                        {
                            throw new ArgumentException(
                                "Domain, username, and password are required for user-defined credentials.");
                        }

                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(credentialsMode));
                }

                // Create ExchangeService instance
                var exchangeService = new ExchangeService(GetExchangeVersion(exchangeVersion));

                // Configure connection type
                switch (connectionType)
                {
                    case ConnectionTypeEnum.AutoDiscovery:
                        exchangeService.AutodiscoverUrl(EmailAddress.Get(context));
                        break;

                    case ConnectionTypeEnum.ExchangeServerAddress:
                        exchangeService.Url = new Uri(ServerAddress.Get(context));
                        break;
                }

                // Configure credentials
                switch (credentialsMode)
                {
                    case CredentialsEnum.ExchangeDefault:
                        break;

                    case CredentialsEnum.UserDefined:
                        exchangeService.Credentials = new NetworkCredential(
                            Username.Get(context),
                            Password.Get(context),
                            Domain.Get(context)
                        );
                        break;
                }

                // Set timeout
                exchangeService.Timeout = TimeSpan.FromSeconds(timeout).Milliseconds;

                // Test connection
                try
                {
                    exchangeService.FindFolders(WellKnownFolderName.Inbox, new FolderView(1));
                    status = $"Successfully connected to Exchange server '{exchangeVersion}'.";
                }
                catch (Exception ex)
                {
                    status = $"Error connecting to Exchange server: {ex.Message}";
                    exchangeService = null;
                }

                ExchangeConnection.Set(context, exchangeService);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Exchange Connection Successfully");
            }
            catch (Exception ex)
            {
                ExchangeConnection.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error connecting to Exchange server: {ex.Message}");

            }
        }

        private static ExchangeVersion GetExchangeVersion(ExchangeVersionEnum version)
        {
            switch (version)
            {
                case ExchangeVersionEnum.Exchange2007_SP1:
                    return ExchangeVersion.Exchange2007_SP1;
                case ExchangeVersionEnum.Exchange2010:
                    return ExchangeVersion.Exchange2010;
                case ExchangeVersionEnum.Exchange2010_SP1:
                    return ExchangeVersion.Exchange2010_SP1;
                case ExchangeVersionEnum.Exchange2010_SP2:
                    return ExchangeVersion.Exchange2010_SP2;
                case ExchangeVersionEnum.Exchange2013:
                    return ExchangeVersion.Exchange2013;
                case ExchangeVersionEnum.Exchange2013_SP1:
                    return ExchangeVersion.Exchange2013_SP1;
                default:
                    throw new ArgumentException($"Unsupported Exchange version: {version}");
            }
        }
    }

    public enum ConnectionTypeEnum
    {
        [Display(Name = "Auto discovery", Description = "Uses auto-discovery with an email address.")]
        AutoDiscovery,

        [Display(Name = "Exchange server address", Description = "Directly connects using the server address.")]
        ExchangeServerAddress
    }

    public enum CredentialsEnum
    {
        [Display(Name = "Exchange default", Description = "Uses default Exchange credentials.")]
        ExchangeDefault,

        [Display(Name = "User defined", Description = "Uses custom domain, username, and password.")]
        UserDefined
    }

    public enum ExchangeVersionEnum
    {
        [Display(Name = "Exchange 2007 SP1", Description = "Microsoft Exchange 2007, Service Pack 1")]
        Exchange2007_SP1,

        [Display(Name = "Exchange 2010", Description = "Microsoft Exchange 2010")]
        Exchange2010,

        [Display(Name = "Exchange 2010 SP1", Description = "Microsoft Exchange 2010, Service Pack 1")]
        Exchange2010_SP1,

        [Display(Name = "Exchange 2010 SP2", Description = "Microsoft Exchange 2010, Service Pack 2")]
        Exchange2010_SP2,

        [Display(Name = "Exchange 2013", Description = "Microsoft Exchange 2013")]
        Exchange2013,

        [Display(Name = "Exchange 2013 SP1", Description = "Microsoft Exchange 2013, Service Pack 1")]
        Exchange2013_SP1,
    }
}