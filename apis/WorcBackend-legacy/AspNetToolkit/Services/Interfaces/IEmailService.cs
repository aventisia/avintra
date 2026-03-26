namespace AspNetToolkit.Services;

/// <summary>
/// Represents an interface to implement on email service.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a general email without an email template.
    /// </summary>
    /// <param name="toEmailAddresses">The email addresses of the recipients.</param>
    /// <param name="subject">The subject of the email.</param>
    /// <param name="content">The content of the email.</param>
    /// <param name="ccEmailAddresses">The email addresses to be CC'd.</param>
    /// /// <param name="bccEmailAddresses">The email addresses to be BCC'd.</param>
    /// <returns>A boolean result indicating whether the email was sent successfully.</returns>
    Task<bool> SendEmail(
        string toEmailAddresses,
        string subject,
        string? content,
        string? ccEmailAddresses = null,
        string? bccEmailAddresses = null);

    /// <summary>
    /// Sends an email using an email template.
    /// </summary>
    /// <param name="emailType">The type of email template to use.</param>
    /// <param name="toEmailAddress">The email address of the recipient.</param>
    /// <param name="placeholderValues">The placeholder values to be replaced in the email template.</param>
    /// <param name="ccEmailAddresses">The email addresses to be CC'd.</param>
    /// <param name="bccEmailAddresses">The email addresses to be BCC'd.</param>

    /// <returns>A boolean result indicating whether the email was sent successfully.</returns>
    Task<bool> SendEmailUsingTemplate(
        EmailTypesEnum emailType,
        string toEmailAddress,
        Dictionary<string, string> placeholderValues,
        string? ccEmailAddresses = null,
        string? bccEmailAddresses = null);

    /// <summary>
    /// Gets the email template after replacing the placeholders with actual values.
    /// </summary>
    /// <param name="templateFile">The file path of the email template.</param>
    /// <param name="placeholderValues">The placeholder values to be replaced in the email template.</param>
    /// <returns>The filled email template after replacing the placeholders.</returns>
    string? LoadAndRenderEmailTemplate(
        string templateFile,
        Dictionary<string, string> placeholderValues);


    /// <summary>
    /// Sends a test email using a specified template without replacing placeholders. This is intended for Super Admin (SA) use to verify email template rendering.
    /// </summary>
    /// <param name="emailAddresses"> Recipient email addresses separated by ';' (e.g., "user1@test.com;user2@test.com"). </param>
    /// <param name="templateName"> Name of the email template file (e.g., "AccountCreatedEmailTemplate.html"). </param>
    /// <param name="ccEmailAddresses"> Optional CC email addresses separated by ';'. 
    /// <param name="bccEmailAddresses"> Optional BCC email addresses separated by ';'. </param>
    /// <returns> Returns a <see cref="ServiceResponse{T}"/> indicating success or failure. </returns>
    Task<ServiceResponse<bool>> TestEmailTemplateAsync(
        string emailAddresses,
        string templateName,
        string? ccEmailAddresses = null,
        string? bccEmailAddresses = null
    );
}