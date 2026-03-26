using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace AspNetToolkit.Services;

/// <summary>
/// Implements the email service using MailKit and SendGrid SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public EmailService(
        ILogger<EmailService> logger,
        EnvironmentConfig environmentConfig,
        IWebHostEnvironment webHostEnvironment)
    {
        _environmentConfig = environmentConfig;
        _logger = logger;
        _environmentConfig = environmentConfig;
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

                // Set SSL options
                var socketOptions = SecureSocketOptions.SslOnConnect;

                // Connects to the SMTP server using the specified host, port, and security options.
                await client.ConnectAsync(_environmentConfig.SmtpHost, _environmentConfig.SmtpPort, socketOptions);

                // Authenticate with the SMTP server using the provided credentials.
                await client.AuthenticateAsync(_environmentConfig.SmtpUser, _environmentConfig.SmtpPassword);

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
            case EmailTypesEnum.VerifyEmailAddress:
                return await SendEmail(
                            toEmailAddress,
                            "Verify your email address",
                            LoadAndRenderEmailTemplate(
                                "VerifyEmailAddressEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.AccountDeactivation:
                return await SendEmail(
                            toEmailAddress,
                            "Verify your email address",
                            LoadAndRenderEmailTemplate(
                                "VerifyEmailToDeactivateAccountEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.UpdateEmail:
                return await SendEmail(
                            toEmailAddress,
                            "Verify your email address",
                            LoadAndRenderEmailTemplate(
                                "UpdateEmailRequestCodeEmailTemplate.html",
                                placeholderValues)
                            );
            case EmailTypesEnum.AccountCreated:
                return await SendEmail(
                            toEmailAddresses: toEmailAddress,
                            subject: "Welcome to Aventisia!",
                            content: LoadAndRenderEmailTemplate(
                                "AccountCreatedEmailTemplate.html", placeholderValues),
                            ccEmailAddresses: null,
                            bccEmailAddresses: bccEmailAddresses
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
            case EmailTypesEnum.SubscriptionPlanUpgrade:
                return await SendEmail(
                            toEmailAddress,
                            "Upgrade Plan Request",
                            LoadAndRenderEmailTemplate(
                                "UpgradePlanEmailTemplate.html",
                                placeholderValues)
                            );

            case EmailTypesEnum.CreditTopUpPaymentSuccess:
                return await SendEmail(
                    toEmailAddress,
                    "Credit Top-Up Completed Successfully",
                    LoadAndRenderEmailTemplate(
                        "CreditTopUpSuccessEmailTemplate.html",
                        placeholderValues),
                        ccEmailAddresses: ccEmailAddresses
                );

            case EmailTypesEnum.CreditTopUpPaymentFailed:
                return await SendEmail(
                    toEmailAddress,
                    "Credit Top-Up Payment Failed",
                    LoadAndRenderEmailTemplate(
                        "CreditTopUpFailedEmailTemplate.html",
                        placeholderValues),
                        ccEmailAddresses: ccEmailAddresses
                );

            case EmailTypesEnum.SubscriptionPaymentSuccess:
                return await SendEmail(
                    toEmailAddress,
                    "Subscription Payment Successful",
                    LoadAndRenderEmailTemplate(
                        "SubscriptionPaymentSuccessEmailTemplate.html",
                        placeholderValues),
                        ccEmailAddresses: ccEmailAddresses
                );

            case EmailTypesEnum.SubscriptionPaymentFailed:
                return await SendEmail(
                    toEmailAddress,
                    "Subscription Payment Failed",
                    LoadAndRenderEmailTemplate(
                        "SubscriptionPaymentFailedEmailTemplate.html",
                        placeholderValues),
                        ccEmailAddresses: ccEmailAddresses
                );

            // Send reminder email before subscription expiry
            case EmailTypesEnum.SubscriptionExpiryReminder:
                return await SendEmail(
                    toEmailAddress,
                    "Your subscription is about to expire",
                    LoadAndRenderEmailTemplate("SubscriptionExpiryReminderEmailTemplate.html", placeholderValues),
                    ccEmailAddresses: ccEmailAddresses
                );

            // Send notification email after subscription expired
            case EmailTypesEnum.SubscriptionExpired:
                return await SendEmail(
                    toEmailAddress,
                    "Your subscription has expired",
                    LoadAndRenderEmailTemplate("SubscriptionExpiredEmailTemplate.html", placeholderValues),
                    ccEmailAddresses: ccEmailAddresses
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

    public async Task<ServiceResponse<bool>> TestEmailTemplateAsync(
        string emailAddresses,
        string templateName,
        string? ccEmailAddresses = null,
        string? bccEmailAddresses = null)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to send test email. Please try again."
        };

        try
        {
            // Validate primary email addresses
            if (string.IsNullOrWhiteSpace(emailAddresses))
            {
                serviceResponse.Message = "At least one recipient email address is required.";
                return serviceResponse;
            }

            var toEmailList = emailAddresses
                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim())
                .ToList();

            if (!toEmailList.Any())
            {
                serviceResponse.Message = "No valid recipient email addresses provided.";
                return serviceResponse;
            }

            foreach (var email in toEmailList)
            {
                if (!MailboxAddress.TryParse(email, out _))
                {
                    serviceResponse.Message = $"Invalid recipient email address: {email}";
                    return serviceResponse;
                }
            }

            // Validate CC email addresses (optional)
            if (!string.IsNullOrWhiteSpace(ccEmailAddresses))
            {
                var ccList = ccEmailAddresses.Split(';', StringSplitOptions.RemoveEmptyEntries);

                foreach (var email in ccList)
                {
                    if (!MailboxAddress.TryParse(email.Trim(), out _))
                    {
                        serviceResponse.Message = $"Invalid CC email address: {email}";
                        return serviceResponse;
                    }
                }
            }

            // Validate BCC email addresses (optional)
            if (!string.IsNullOrWhiteSpace(bccEmailAddresses))
            {
                var bccList = bccEmailAddresses.Split(';', StringSplitOptions.RemoveEmptyEntries);

                foreach (var email in bccList)
                {
                    if (!MailboxAddress.TryParse(email.Trim(), out _))
                    {
                        serviceResponse.Message = $"Invalid BCC email address: {email}";
                        return serviceResponse;
                    }
                }
            }

            // Validate template name
            if (string.IsNullOrWhiteSpace(templateName))
            {
                serviceResponse.Message = "Template name is required.";
                return serviceResponse;
            }

            // Prevent path traversal attacks
            if (templateName.Contains("..") || templateName.Contains("/") || templateName.Contains("\\"))
            {
                serviceResponse.Message = "Invalid template name provided.";
                return serviceResponse;
            }

            // Build template file path
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "StaticFiles",
                "EmailTemplates",
                templateName
            );

            // Ensure template exists
            if (!File.Exists(filePath))
            {
                serviceResponse.Message = $"Email template '{templateName}' was not found.";
                return serviceResponse;
            }

            // Load template content (no placeholder replacement for testing)
            var content = await File.ReadAllTextAsync(filePath);

            if (string.IsNullOrWhiteSpace(content))
            {
                serviceResponse.Message = "Email template content is empty.";
                return serviceResponse;
            }

            // ✅ Convert ";" → "," for SendEmail compatibility
            var formattedToEmails = string.Join(",", toEmailList);
            var formattedCcEmails = string.IsNullOrWhiteSpace(ccEmailAddresses)
                ? null
                : string.Join(",", ccEmailAddresses.Split(';', StringSplitOptions.RemoveEmptyEntries).Select(e => e.Trim()));

            var formattedBccEmails = string.IsNullOrWhiteSpace(bccEmailAddresses)
                ? null
                : string.Join(",", bccEmailAddresses.Split(';', StringSplitOptions.RemoveEmptyEntries).Select(e => e.Trim()));

            // Send email using existing service
            var isSent = await SendEmail(
                toEmailAddresses: formattedToEmails,
                subject: $"[TEST TEMPLATE] {templateName}",
                content: content,
                ccEmailAddresses: formattedCcEmails,
                bccEmailAddresses: formattedBccEmails
            );

            if (!isSent)
            {
                serviceResponse.Message = "Email sending failed. Please check SMTP configuration or try again.";
                return serviceResponse;
            }

            // Success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Test email sent successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error while sending test email template '{templateName}': {ex}");
        }

        return serviceResponse;
    }
}