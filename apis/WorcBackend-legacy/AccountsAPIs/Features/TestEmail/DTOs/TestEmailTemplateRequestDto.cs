namespace AccountsAPIs.DTOs;

/// <summary>
/// Request DTO used to send a test email based on a selected template.
/// This is typically used by Super Admin (SA) users to verify how an email template
/// renders in real email clients (e.g., Outlook) without replacing placeholders.
/// </summary>
public class TestEmailTemplateRequestDto
{
    /// <summary>
    /// One or more recipient email addresses separated by semicolon (;).
    /// Example: "user1@test.com;user2@test.com"
    /// </summary>
    public required string EmailAddresses { get; set; }

    /// <summary>
    /// Name of the email template file located in the EmailTemplates directory.
    /// Example: "AccountCreatedEmailTemplate.html"
    /// </summary>
    public required string TemplateName { get; set; }

    /// <summary>
    /// Optional CC (Carbon Copy) email addresses separated by semicolon (;).
    /// Example: "cc1@test.com;cc2@test.com"
    /// </summary>
    public string? CcEmailAddresses { get; set; }

    /// <summary>
    /// Optional BCC (Blind Carbon Copy) email addresses separated by semicolon (;).
    /// These recipients will receive the email without being visible to others.
    /// Example: "bcc1@test.com;bcc2@test.com"
    /// </summary>
    public string? BccEmailAddresses { get; set; }
}