/*Using statements are only required here. Also, Microsoft.Graph.Models 
create ambiguous error due to Tenant object*/

using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace AspNetToolkit.Services;

public class EmailService : IEmailService
{
    private readonly EmailConfig _emailConfig;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        EmailConfig emailConfig,
        ILogger<EmailService> logger)
    {
        _emailConfig = emailConfig;
        _logger = logger;
    }

    // Sends a general email without an email template.
    public async Task<bool> SendEmail(
        string toEmailAddresses,
        string subject,
        string? content,
        string? ccEmailAddresses = null)
    {
        try
        {
            // TenantId missing
            if (string.IsNullOrWhiteSpace(_emailConfig.MS365EmailService.TenantId))
            {
                _logger.LogError($"EmailConfig:TenantId cannot be null");
                return false;
            }

            // AppId missing
            if (string.IsNullOrWhiteSpace(_emailConfig.MS365EmailService.AppId))
            {
                _logger.LogError($"EmailConfig:AppId cannot be null");
                return false;
            }

            // Secret missing
            if (string.IsNullOrWhiteSpace(_emailConfig.MS365EmailService.Secret))
            {
                _logger.LogError($"EmailConfig:Secret cannot be null");
                return false;
            }

            // FromEmailAddress missing
            if (string.IsNullOrWhiteSpace(_emailConfig.MS365EmailService.FromEmailAddress))
            {
                _logger.LogError($"EmailConfig:FromEmailAddress cannot be null");
                return false;
            }

            // ToEmailAddress missing
            if (string.IsNullOrWhiteSpace(toEmailAddresses))
            {
                _logger.LogError($"ToEmailAddress is requird to send email");
                return false;
            }

            // Subject missing
            if (string.IsNullOrWhiteSpace(subject))
            {
                _logger.LogError($"Subject is requird to send email");
                return false;
            }

            // Content missing
            if (string.IsNullOrWhiteSpace(content))
            {
                _logger.LogError($"Email contnent is required to send email");
                return false;
            }


            // Define "AVENTISIA Support Email Service" credentials
            var clientSecretCredential = new ClientSecretCredential(
                _emailConfig.MS365EmailService.TenantId,
                _emailConfig.MS365EmailService.AppId,
                _emailConfig.MS365EmailService.Secret);

            // Define new Microsoft Graph client
            var graphServiceClient = new GraphServiceClient(clientSecretCredential);

            // Send email
            await graphServiceClient
                .Users[_emailConfig.MS365EmailService.FromEmailAddress]
                .SendMail
                .PostAsync(new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody()
                {
                    SaveToSentItems = true,
                    Message = new Message()
                    {
                        Subject = subject,
                        Body = new ItemBody
                        {
                            ContentType = BodyType.Html,
                            Content = content
                        },
                        ToRecipients = new List<Recipient>()
                        {
                            new Recipient
                            {
                                EmailAddress = new EmailAddress
                                {
                                    Address = toEmailAddresses
                                }
                            }
                        },
                        CcRecipients = GetOptionalCcRecipients(ccEmailAddresses)
                    }
                });

            // Log information
            _logger.LogInformation($"Email has been sent to {toEmailAddresses} " +
                $"with subject {subject}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }

    // Sends an email using an email template.
    public async Task<bool> SendEmailUsingTemplate(EmailTypesEnum emailType, string toEmailAddress, Dictionary<string, string> placeholderValues)
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
                            "Welcome to AVENTISIA!",
                            LoadAndRenderEmailTemplate(
                                "AccountCreatedEmailTemplate.html",
                                placeholderValues)
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
        }

        _logger.LogError($"Email type {emailType} did not match with any email template");
        return false;
    }

    // Gets the email template after replacing the placeholders with actual values.
    public string? LoadAndRenderEmailTemplate(string templateFile, Dictionary<string, string> placeholderValues)
    {
        try
        {
            // Get template file
            var file = new FileInfo(Path.Combine(
                Directory.GetCurrentDirectory(),
                Path.Combine(Path.Combine("StaticFiles", "EmailTemplates")
                    , templateFile)));

            // File does not exist
            if (!file.Exists)
            {
                _logger.LogError($"Email template file does not exists " +
                    $"with file name {templateFile}");
                return null;
            }

            // Load the template file.  
            var templateContent = File.ReadAllText(file.FullName);

            // Replace the placeholders with the actual values.
            foreach (var placeholder in placeholderValues.Keys)
            {
                templateContent = templateContent.Replace(
                    placeholder,
                    placeholderValues[placeholder]);
            }

            // Return the rendered template.
            return templateContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return null;
        }
    }

    /*-------------Helper Functions-------------*/

    // Gets the optional CC recipients.
    private List<Recipient>? GetOptionalCcRecipients(string ccEmailAddresses)
    {
        if (ccEmailAddresses == null)
            return new List<Recipient>();

        return new List<Recipient>()
        {
            new Recipient
            {
                EmailAddress = new EmailAddress
                {
                    Address = ccEmailAddresses
                }
            }
        };
    }
}