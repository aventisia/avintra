using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using Renci.SshNet;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Open Secure FTP Connection")]
    [Description("Establishes a secure connection to an FTP server using SSL/TLS or SSH.")]
    [ActivityMetaData(nodeImg:"/assets/FTP.svg")]

    public class OpenSecureFtpConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Host")]
        [Description("The FTP server URL (e.g., ftp.example.com).")]
        public InArgument<string> Host { get; set; }

        [DisplayName("Port")]
        [Description("The port number for the FTP connection (default is 21 for FTPS, 22 for SFTP).")]
        [DefaultValue(22)]
        public InArgument<int> Port { get; set; }

        [RequiredArgument]
        [DisplayName("Secure FTP Protocol")]
        [Description("Specifies the secure FTP protocol to use (SFTP, FTPS explicit, FTPS implicit).")]
        public InArgument<SecureFtpProtocolEnum> SecureFtpProtocol { get; set; }

        [RequiredArgument]
        [DisplayName("Authentication Method")]
        [Description(
            "Specifies the authentication method to use (Username and password, Private key, Private key and passphrase).")]
        public InArgument<AuthenticationMethodEnum> AuthenticationMethod { get; set; }

        [DisplayName("Username")]
        [Description(
            "The username for authentication (required if 'Authentication Method' is 'Username and password').")]
        [RenderIfCondition(nameof(AuthenticationMethod), AuthenticationMethodEnum.UsernameAndPassword)]
        public InArgument<string> Username { get; set; }

        [DisplayName("Password")]
        [Description(
            "The password for authentication (required if 'Authentication Method' is 'Username and password').")]
        [RenderIfCondition(nameof(AuthenticationMethod), AuthenticationMethodEnum.UsernameAndPassword)]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Path to Private Key")]
        [Description("The path to the private key file (required if using SFTP with private key).")]
        [RenderIfCondition(nameof(AuthenticationMethod), AuthenticationMethodEnum.PrivateKey)]
        [RenderIfCondition(nameof(AuthenticationMethod), AuthenticationMethodEnum.PrivateKeyAndPassphrase)]
        public InArgument<string> PathToPrivateKey { get; set; }

        [DisplayName("Private Key Passphrase")]
        [Description("The passphrase for the private key (required if using private key with passphrase).")]
        [RenderIfCondition(nameof(AuthenticationMethod), AuthenticationMethodEnum.PrivateKeyAndPassphrase)]
        public InArgument<string> PrivateKeyPassphrase { get; set; }

        [DisplayName("Active Mode")]
        [Description("If true, uses active mode for FTP connection.")]
        public InArgument<bool> ActiveMode { get; set; }

        [DisplayName("Accept Untrusted Certificates")]
        [Description("If true, accepts untrusted certificates during TLS negotiation.")]
        public InArgument<bool> AcceptUntrustedCertificates { get; set; }

        [DisplayName("Timeout")]
        [Description("The timeout in seconds for the FTP connection attempt.")]
        [DefaultValue(10)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("FTPS Connection")]
        [Description("Returns the FTPS connection (FluentFTP).")]
        public OutArgument<FtpClient> FtpsConnection { get; set; }

        [DisplayName("SFTP Connection")]
        [Description("Returns the SFTP connection (Renci.SshNet).")]
        public OutArgument<SftpClient> SftpConnection { get; set; }
        
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var host = Host.Get(context);
                var port = Port.Get(context);
                var protocol = SecureFtpProtocol.Get(context);
                var authMethod = AuthenticationMethod.Get(context);
                var username = Username.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var privateKeyPath = PathToPrivateKey.Get(context);
                var privateKeyPassphrase = PrivateKeyPassphrase.Get(context);
                var activeMode = ActiveMode.Get(context);
                var acceptUntrusted = AcceptUntrustedCertificates.Get(context);
                var timeoutSeconds = Timeout.Get(context);

                if (string.IsNullOrWhiteSpace(host))
                    throw new ArgumentException("Host is required.");
                if (port <= 0)
                    throw new ArgumentException("Port must be greater than 0.");

                // Centralized validation
                switch (authMethod)
                {
                    case AuthenticationMethodEnum.UsernameAndPassword:
                        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                            throw new ArgumentException("Username and password are required.");
                        break;

                    case AuthenticationMethodEnum.PrivateKey:
                        if (string.IsNullOrWhiteSpace(privateKeyPath))
                            throw new ArgumentException("Path to private key is required.");
                        break;

                    case AuthenticationMethodEnum.PrivateKeyAndPassphrase:
                        if (string.IsNullOrWhiteSpace(privateKeyPath) || string.IsNullOrWhiteSpace(privateKeyPassphrase))
                            throw new ArgumentException("Path to private key and passphrase are required.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(authMethod));
                }

                switch (protocol)
                {
                    case SecureFtpProtocolEnum.SFTP:
                        SftpClient sftpClient = null;

                        if (authMethod == AuthenticationMethodEnum.UsernameAndPassword)
                        {
                            var connectionInfo = new ConnectionInfo(
                                host, port, username,
                                new PasswordAuthenticationMethod(username, password))
                            {
                                Timeout = TimeSpan.FromSeconds(timeoutSeconds)
                            };
                            sftpClient = new SftpClient(connectionInfo);
                        }
                        else
                        {
                            var pkFile = string.IsNullOrWhiteSpace(privateKeyPassphrase)
                                ? new PrivateKeyFile(privateKeyPath)
                                : new PrivateKeyFile(privateKeyPath, privateKeyPassphrase);

                            var connectionInfo = new ConnectionInfo(
                                host, port, username,
                                new PrivateKeyAuthenticationMethod(username, pkFile))
                            {
                                Timeout = TimeSpan.FromSeconds(timeoutSeconds)
                            };
                            sftpClient = new SftpClient(connectionInfo);
                        }

                        sftpClient.Connect();
                        if (!sftpClient.IsConnected)
                            throw new InvalidOperationException("Failed to connect via SFTP.");

                        SftpConnection.Set(context, sftpClient);
                        FtpsConnection.Set(context, null);
                        break;

                    case SecureFtpProtocolEnum.FTPSExplicit:
                    case SecureFtpProtocolEnum.FTPSImplicit:
                        if (authMethod != AuthenticationMethodEnum.UsernameAndPassword)
                            throw new NotSupportedException("FTPS only supports username/password authentication.");

                        var ftpsClient = new FtpClient(host, port)
                        {
                            Credentials = new System.Net.NetworkCredential(username, password),
                            Config =
                            {
                                EncryptionMode = GetEncryptionMode(protocol),
                                ValidateAnyCertificate = acceptUntrusted,
                                DataConnectionType = activeMode ? FtpDataConnectionType.AutoActive : FtpDataConnectionType.AutoPassive,
                                SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls,
                                ConnectTimeout = timeoutSeconds * 1000
                            },
                        };

                        ftpsClient.Connect();
                        if (!ftpsClient.IsConnected)
                            throw new InvalidOperationException("Failed to connect via FTPS.");

                        FtpsConnection.Set(context, ftpsClient);
                        SftpConnection.Set(context, null);
                        break;

                    default:
                        throw new NotSupportedException("Unsupported secure FTP protocol.");
                }

                StatusMessage.Set(context, $"Successfully connected to '{host}:{port}' via {protocol}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error connecting to secure FTP: {ex.Message}");
                IsSuccess.Set(context, false);
                FtpsConnection.Set(context, null);
                SftpConnection.Set(context, null);
            }
        }

        private FtpEncryptionMode GetEncryptionMode(SecureFtpProtocolEnum protocol)
        {
            switch (protocol)
            {
                case SecureFtpProtocolEnum.FTPSExplicit:
                    return FtpEncryptionMode.Explicit;
                case SecureFtpProtocolEnum.FTPSImplicit:
                    return FtpEncryptionMode.Implicit;
                default:
                    throw new NotSupportedException("Only FTPS protocols are supported by FluentFTP.");
            }
        }
    }

    public enum SecureFtpProtocolEnum
    {
        [Display(Name = "SFTP", Description = "Secure File Transfer Protocol over SSH.")]
        SFTP,

        [Display(Name = "FTPS explicit", Description = "FTP over TLS with explicit encryption.")]
        FTPSExplicit,

        [Display(Name = "FTPS implicit", Description = "FTP over TLS with implicit encryption.")]
        FTPSImplicit
    }

    public enum AuthenticationMethodEnum
    {
        [Display(Name = "Username and password", Description = "Authenticates using username and password.")]
        UsernameAndPassword,

        [Display(Name = "Private key", Description = "Authenticates using a private key.")]
        PrivateKey,

        [Display(Name = "Private key and passphrase",
            Description = "Authenticates using a private key and passphrase.")]
        PrivateKeyAndPassphrase
    }
}