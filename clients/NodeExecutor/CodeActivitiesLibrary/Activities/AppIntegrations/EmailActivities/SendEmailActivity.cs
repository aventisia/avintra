using CodeActivitiesLibrary.Extensions;
using MailKit.Security;
using MimeKit;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Security;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace CodeActivitiesLibrary.AppIntegrations.EmailActivities
{
    [DisplayName("Send Email")]
    [Description("Creates and sends a new email message using MailKit.")]
    [ActivityMetaData(nodeImg:"/assets/Email.svg")]
    public class SendEmailActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("From")]
        [Description("The sender's email address.")]
        public InArgument<string> From { get; set; }

        [RequiredArgument]
        [DisplayName("To")]
        [Description("The recipient's email address(es) (comma-separated).")]
        public InArgument<string> To { get; set; }


        [DisplayName("CC")]
        [Description("The CC recipients' email addresses (comma-separated).")]
        public InArgument<string> Cc { get; set; }


        [DisplayName("BCC")]
        [Description("The BCC recipients' email addresses (comma-separated).")]
        public InArgument<string> Bcc { get; set; }

        [RequiredArgument]
        [DisplayName("Subject")]
        [Description("The subject of the email.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument]
        [DisplayName("Body")]
        [Description("The body of the email.")]
        public InArgument<string> Body { get; set; }


        [DisplayName("Body Format")]
        [Description("The format of the email body (Text or Html).")]
        [DefaultValue(EmailBodyFormatEnum.Text)]
        public InArgument<EmailBodyFormatEnum> BodyFormat { get; set; }


        [DisplayName("Attachments")]
        [Description("Paths to files to attach to the email (comma-separated).")]
        public InArgument<string> Attachments { get; set; }

        [RequiredArgument]
        [DisplayName("SMTP Server")]
        [Description("The SMTP server URL.")]
        public InArgument<string> SmtpServer { get; set; }


        [DisplayName("Server Port")]
        [Description("The port number for the SMTP server (default is 587).")]
        public InArgument<int> ServerPort { get; set; } = new InArgument<int>(587);


        [DisplayName("Security Protocol")]
        [Description("The security protocol to use for the connection.")]
        [DefaultValue(SecureSocketOptions.Auto)]
        public InArgument<SecureSocketOptions> SecurityProtocol { get; set; }


        [DisplayName("SMTP Server Needs Authentication")]
        [Description("If true, authenticates with the SMTP server using credentials.")]
        public InArgument<bool> SmtpServerNeedsAuthentication { get; set; } = true;


        [DisplayName("User Name")]
        [Description("The username for authentication.")]
        public InArgument<string> UserName { get; set; }


        [DisplayName("Password")]
        [Description("The password for authentication.")]
        public InArgument<SecureString> Password { get; set; }


        [DisplayName("Accept Untrusted Certificates")]
        [Description("If true, accepts untrusted SSL certificates.")]
        public InArgument<bool> EnableSsl { get; set; } = false;


        [DisplayName("Timeout (seconds)")]
        [Description("Connection timeout in seconds (default is 30).")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; } = new InArgument<int>(30);

        protected override void Execute(CodeActivityContext context)
        {

            try
            {
                // Get input values
                var from = From.Get(context);
                var to = To.Get(context);
                var cc = Cc.Get(context);
                var bcc = Bcc.Get(context);
                var subject = Subject.Get(context);
                var body = Body.Get(context);
                var bodyFormat = BodyFormat.Get(context);
                var attachments = Attachments.Get(context);
                var smtpServer = SmtpServer.Get(context);
                var serverPort = ServerPort.Get(context);
                var securityProtocol = SecurityProtocol.Get(context);
                var smtpServerNeedsAuthentication = SmtpServerNeedsAuthentication.Get(context);
                var userName = UserName.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var acceptUntrustedCertificates = EnableSsl.Get(context);
                var timeout = Timeout.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(from))
                    throw new ArgumentException("Sender's email address cannot be empty.");

                if (string.IsNullOrWhiteSpace(to))
                    throw new ArgumentException("Recipient's email address cannot be empty.");

                if (string.IsNullOrWhiteSpace(smtpServer))
                    throw new ArgumentException("SMTP server cannot be empty.");

                if (smtpServerNeedsAuthentication &&
                    (string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(password)))
                    throw new ArgumentException("Username and password are required for authentication.");

                // Create the email message
                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(from));

                // Add recipients
                foreach (var address in to.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                    message.To.Add(MailboxAddress.Parse(address.Trim()));

                if (!string.IsNullOrWhiteSpace(cc))
                    foreach (var address in cc.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                        message.Cc.Add(MailboxAddress.Parse(address.Trim()));

                if (!string.IsNullOrWhiteSpace(bcc))
                    foreach (var address in bcc.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                        message.Bcc.Add(MailboxAddress.Parse(address.Trim()));

                message.Subject = subject;

                // Create the message body
                var builder = new BodyBuilder();

                switch (bodyFormat)
                {
                    case EmailBodyFormatEnum.Text:
                        builder.TextBody = body;
                        break;
                    case EmailBodyFormatEnum.Html:
                        builder.HtmlBody = body;
                        break;
                    default:
                        throw new ArgumentException("Invalid body format specified.");
                }

                // Add attachments
                if (!string.IsNullOrWhiteSpace(attachments))
                    foreach (var attachmentPath in attachments.Split(new[] { ',', ';' },
                                 StringSplitOptions.RemoveEmptyEntries))
                    {
                        var trimmedPath = attachmentPath.Trim();
                        if (!File.Exists(trimmedPath))
                            throw new FileNotFoundException($"Attachment not found: {trimmedPath}");

                        builder.Attachments.Add(trimmedPath);
                    }

                message.Body = builder.ToMessageBody();

                // Send the email
                using (var client = new SmtpClient())
                {
                    // Configure certificate validation
                    if (acceptUntrustedCertificates) client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    // Set timeout
                    client.Timeout = timeout * 1000;

                    // Connect to the SMTP server
                    client.Connect(smtpServer, serverPort, securityProtocol);

                    // Authenticate if needed
                    if (smtpServerNeedsAuthentication) client.Authenticate(userName, password);

                    // Send the message
                    client.Send(message);

                    // Disconnect
                    client.Disconnect(true);
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Email sent successfully to {to} with subject '{subject}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error sending email: {ex.Message}");

            }

        }
    }

    public enum EmailBodyFormatEnum
    {
        [Display(Name = "Plain", Description = "Plain text format")]
        Text,

        [Display(Name = "Html", Description = "HTML format")]
        Html
    }
}