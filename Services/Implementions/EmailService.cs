using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace AspNetToolkit.Services;

/// <summary>
/// Implements the email service using MailKit and SendGrid SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly SmtpConfig _smtpConfig;
    private readonly ILogger<EmailService> _logger;
    private readonly GeneralConfig _generalConfig;

    public EmailService(SmtpConfig smtpConfig, ILogger<EmailService> logger, GeneralConfig generalConfig)
    {
        _smtpConfig = smtpConfig;
        _logger = logger;
        _generalConfig = generalConfig;
    }

    /// <inheritdoc />
    public async Task<bool> SendEmail(string toEmailAddresses, string subject, string? content, 
        string? ccEmailAddresses = null, string? bccEmailAddresses = null)
    {
        try
        {
            // Validates the smtp server configuration.
            Guard.Against.Null(_smtpConfig, "Smtp Server config cannot be null");

            // Validates inputs.
            if (string.IsNullOrWhiteSpace(toEmailAddresses))
            {
                _logger.LogError("Recipient email address is required.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(subject))
            {
                _logger.LogError("Subject is required to send email.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(content))
            {
                _logger.LogError("Email content is required.");
                return false;
            }

            var message = new MimeMessage();

            // Sets the the sender's name and address.
            message.From.Add(new MailboxAddress(_smtpConfig.MailFromName, _smtpConfig.MailFromAddress));

            // Splits the recipient email addresses and adds them to the message.
            var toEmailAddressList = toEmailAddresses.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // Sets the recipients' addresses.
            foreach (var toEmailAddress in toEmailAddressList)
            {
                message.To.Add(new MailboxAddress(string.Empty, toEmailAddress.Trim()));
            }

            // Adds CC if provided
            if (!string.IsNullOrWhiteSpace(ccEmailAddresses))
            {
                // Splits the CC email addresses and adds them to the message.
                var ccEmailAddressList = ccEmailAddresses.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

                // Sets the CC recipients' addresses.
                foreach (var ccEmailAddress in ccEmailAddressList)
                {
                    message.Cc.Add(new MailboxAddress(string.Empty, ccEmailAddress.Trim()));
                }
            }

            // Adds BCC get notified of account creation
            if (!string.IsNullOrWhiteSpace(bccEmailAddresses))
            {
                // Splits the BCC email addresses and adds them to the message.
                var bccEmailAddressList = bccEmailAddresses.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

                // Sets the BCC recipients' addresses.
                foreach (var bccEmailAddress in bccEmailAddressList)
                {
                    message.Bcc.Add(new MailboxAddress(string.Empty, bccEmailAddress.Trim()));
                }
            }
            
           

            // Sets the subject of the email.
            message.Subject = subject;

            // Sets the body of the email.
            var bodyBuilder = new BodyBuilder
            {
                TextBody = content,
                HtmlBody = content
            };
            message.Body = bodyBuilder.ToMessageBody();

            // Creates a new SMTP client.
            using (var client = new SmtpClient())
            {
                // Force a secure connection over TLS.
                var socketOptions = SecureSocketOptions.SslOnConnect;

                // Connects to the SMTP server.
                await client.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, socketOptions);

                // Authenticates with the SMTP server if credentials are provided.
                await client.AuthenticateAsync(_smtpConfig.Username, _smtpConfig.ApiKey);

                // Sends the email.
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }

            // Log the email sent and return true.
            _logger.LogInformation($"Email has been sent to {toEmailAddresses} with subject {subject}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while sending email: {ex.Message}");
            return false;
        }
    }

    // Sends an email using an email template.
    public async Task<bool> SendEmailUsingTemplate(EmailTypesEnum emailType, string toEmailAddress, Dictionary<string, string> placeholderValues,
                    string? bccEmailAddresses = null)
    {
        switch (emailType)
        {
            case EmailTypesEnum.VerifyEmailAddress:
                return await SendEmail(
                            toEmailAddress,
                            "Verify your email address",
                            LoadAndRenderEmailTemplate(
                                "VerifyEmailAddressEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.AccountCreated:
                return await SendEmail(
                            toEmailAddress,
                            "Welcome to Aventisia!",
                            LoadAndRenderEmailTemplate(
                                "AccountCreatedEmailTemplate.html",
                                placeholderValues), null, bccEmailAddresses
                            );
            case EmailTypesEnum.TwoFA:
                return await SendEmail(
                            toEmailAddress,
                            "2FA verification code",
                            LoadAndRenderEmailTemplate(
                                "2FAEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.ResetPwd:
                return await SendEmail(
                            toEmailAddress,
                            "Want to reset your password?",
                            LoadAndRenderEmailTemplate(
                                "ResetPwdCodeEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.PwdReset:
                return await SendEmail(
                            toEmailAddress,
                            "Your password has been reset",
                            LoadAndRenderEmailTemplate(
                                "PwdResetCompleteEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.PwdUpdated:
                return await SendEmail(
                            toEmailAddress,
                            "Your password has been updated",
                            LoadAndRenderEmailTemplate(
                                "PwdUpdateCompleteEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.ContactUsRequest:
                return await SendEmail(
                            toEmailAddress,
                            "New Contact Us Request",
                            LoadAndRenderEmailTemplate(
                                "ContactUsRequestEmailTemplate.html",
                                placeholderValues)
                            );
        }

        _logger.LogError($"Email type {emailType} did not match with any email template");
        return false;
    }

    // Gets the email template after replacing the placeholders with actual values.
    public string? LoadAndRenderEmailTemplate(string templateFile, Dictionary<string, string> placeholderValues)
    {
        try
        {
            // Gets the full path of the template file from the directory.
            var file = new FileInfo(Path.Combine(Directory.GetCurrentDirectory(), "StaticFiles", "EmailTemplates", templateFile));

            // Checks if the template file exists.
            if (!file.Exists)
            {
                _logger.LogError($"Email template file does not exist " +
                    $"with file name {templateFile}");
                return null;
            }

            // Reads all the contents of the template file.
            string templateContent = File.ReadAllText(file.FullName);

            // Replace the placeholders with the actual values.
            foreach (var placeholder in placeholderValues.Keys)
            {
                templateContent = templateContent.Replace(placeholder, placeholderValues[placeholder]);
            }

            return templateContent;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error while rendering email template: {ex.Message}");
            return null;
        }
    }
}