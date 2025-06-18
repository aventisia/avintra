using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using Renci.SshNet;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Open Secure FTP Connection")]
    [Description("Establishes a secure connection to an FTP server using SSL/TLS or SSH.")]
    public class OpenSecureFtpConnectionActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

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
        public InArgument<string> Password { get; set; }

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

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("SFTP Connection")]
        [Description("Returns the connection ID for the opened SFTP connection.")]
        public OutArgument<FtpClient> SftpConnection { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var host = Host.Get(context);
                var port = Port.Get(context);
                var secureFtpProtocol = SecureFtpProtocol.Get(context);
                var authMethod = AuthenticationMethod.Get(context);
                var username = Username.Get(context);
                var password = Password.Get(context);
                var privateKeyPath = PathToPrivateKey.Get(context);
                var privateKeyPassphrase = PrivateKeyPassphrase.Get(context);
                var activeMode = ActiveMode.Get(context);
                var acceptUntrusted = AcceptUntrustedCertificates.Get(context);
                var timeoutSeconds = Timeout.Get(context);

                if (string.IsNullOrWhiteSpace(host))
                    throw new ArgumentException("Host cannot be empty.");

                if (port <= 0)
                    throw new ArgumentException("Port must be greater than 0.");

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
                        if (string.IsNullOrWhiteSpace(privateKeyPath) ||
                            string.IsNullOrWhiteSpace(privateKeyPassphrase))
                            throw new ArgumentException("Path to private key and passphrase are required.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(authMethod));
                }

                // Create appropriate client based on protocol
                object ftpClient = null;
                string connectionId = null;

                switch (secureFtpProtocol)
                {
                    case SecureFtpProtocolEnum.SFTP:
                        {
                            // Use Renci.SshNet for SFTP
                            if (authMethod == AuthenticationMethodEnum.UsernameAndPassword)
                            {
                                var connectionInfo = new ConnectionInfo(
                                    host,
                                    username,
                                    new PasswordAuthenticationMethod(username, password)
                                );
                                ftpClient = new SftpClient(connectionInfo);
                            }
                            else if (authMethod == AuthenticationMethodEnum.PrivateKey ||
                                     authMethod == AuthenticationMethodEnum.PrivateKeyAndPassphrase)
                            {
                                var privateKeyFile = new PrivateKeyFile(privateKeyPath, privateKeyPassphrase);
                                var connectionInfo = new ConnectionInfo(
                                    host,
                                    username,
                                    new PrivateKeyAuthenticationMethod(username, privateKeyFile)
                                );
                                ftpClient = new SftpClient(connectionInfo);
                            }

                        ((SftpClient)ftpClient)?.Connect();
                            connectionId = $"sftp_{host}_{port}";
                            break;
                        }

                    case SecureFtpProtocolEnum.FTPSExplicit:
                    case SecureFtpProtocolEnum.FTPSImplicit:
                        {
                            // Use FluentFTP for FTPS
                            var client = new FtpClient();
                            client.Host = host;
                            client.Port = port;
                            client.Config.EncryptionMode = GetEncryptionMode(secureFtpProtocol);
                            client.Config.ValidateAnyCertificate = acceptUntrusted;
                            client.Config.DataConnectionType = activeMode
                                ? FtpDataConnectionType.AutoActive
                                : FtpDataConnectionType.AutoPassive;
                            client.Config.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls;

                            switch (authMethod)
                            {
                                case AuthenticationMethodEnum.UsernameAndPassword:
                                    client.Credentials = new System.Net.NetworkCredential(username, password);
                                    break;

                                default:
                                    throw new NotSupportedException(
                                        $"FTPS does not support '{authMethod}' authentication.");
                            }

                            var isConnected = false;
                            try
                            {
                                client.Connect();
                                isConnected = client.IsConnected;
                            }
                            catch (Exception ex)
                            {
                                throw new InvalidOperationException($"Failed to connect via FTPS: {ex.Message}");
                            }

                            if (!isConnected)
                                throw new InvalidOperationException("Could not establish secure FTPS connection.");

                            ftpClient = client;
                            connectionId = $"ftps_{host}_{port}";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(secureFtpProtocol));
                }

                // Save connection reference
                SftpConnection.Set(context, ftpClient);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully connected to '{host}:{port}' via {secureFtpProtocol}");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error connecting to secure FTP: {ex.Message}");
                IsSuccess.Set(context, false);
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