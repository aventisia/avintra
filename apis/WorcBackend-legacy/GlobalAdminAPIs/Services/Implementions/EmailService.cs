using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace GlobalAdminAPIs.Services;

/// <summary>
/// Implements the email service using MailKit and SendGrid SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ILogger<EmailService> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public EmailService(EnvironmentConfig environmentConfig, ILogger<EmailService> logger, IWebHostEnvironment webHostEnvironment)
    {
        _environmentConfig = environmentConfig;
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
    }

    /// <inheritdoc />
    public async Task<bool> SendEmail(string toEmailAddresses, string subject, string? content,
        string? ccEmailAddresses = null, string? bccEmailAddresses = null)
    {
        try
        {
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
            message.From.Add(new MailboxAddress(_environmentConfig.SmtpMailFromName, _environmentConfig.SmtpMailFromAddress));

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

                // Use no encryption for "Localhost" environment, otherwise use SSL encryption.
                var socketOptions = _webHostEnvironment.IsEnvironment("Localhost") ? SecureSocketOptions.None : SecureSocketOptions.SslOnConnect;

                // Connects to the SMTP server using the specified host, port, and security options.
                await client.ConnectAsync(_environmentConfig.SmtpHost, _environmentConfig.SmtpPort, socketOptions);

                // If not in "Localhost" environment, authenticate with the SMTP server using the provided credentials.
                if (!_webHostEnvironment.IsEnvironment("Localhost"))
                {
                    await client.AuthenticateAsync(_environmentConfig.SmtpUser, _environmentConfig.SmtpPassword);
                }
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
                    string? ccEmailAddresses = null, string? bccEmailAddresses = null)
    {
        switch (emailType)
        {
            case EmailTypesEnum.ValidationCheckFailed:
                return await SendEmail(
                    toEmailAddress,
                    "Validation Failed – Action Required",
                    LoadAndRenderEmailTemplate("ValidationFailedEmailTemplate.html", placeholderValues),
                    ccEmailAddresses,
                    bccEmailAddresses
                );
            case EmailTypesEnum.InvalidRequest:
                return await SendEmail(
                    toEmailAddress,
                    "Invalid Request – Action Required",
                    LoadAndRenderEmailTemplate("InvalidRequestEmailTemplate.html", placeholderValues),
                    ccEmailAddresses,
                    bccEmailAddresses
                );

            case EmailTypesEnum.ContractExpiration:
                return await SendEmail(
                    toEmailAddress,
                    "Contract Expirated – Action Required",
                    LoadAndRenderEmailTemplate("ContractExpiratedEmailTemplate.html", placeholderValues),
                    ccEmailAddresses,
                    bccEmailAddresses
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