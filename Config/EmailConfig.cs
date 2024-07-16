namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for email services.
/// </summary>
public class EmailConfig
{
    /// <summary>
    /// Gets or sets the required MS365 email service.
    /// </summary>
    public required MS365EmailService MS365EmailService { get; set; }

    /// <summary>
    /// Gets or sets the optional SendGrid email service.
    /// </summary>
    public SendGridEmailService? SendGridEmailService { get; set; }
}


/// <summary>
/// Represents the configuration for the MS365EmailService.
/// </summary>
public class MS365EmailService
{
    /// <summary>
    /// Gets or sets the tenant ID.
    /// </summary>
    public required string TenantId { get; set; }

    /// <summary>
    /// Gets or sets the application ID.
    /// </summary>
    public required string AppId { get; set; }

    /// <summary>
    /// Gets or sets the secret.
    /// </summary>
    public required string Secret { get; set; }

    /// <summary>
    /// Gets or sets the email address from which the emails will be sent.
    /// </summary>
    public required string FromEmailAddress { get; set; }
}

/// <summary>
/// Represents a service for sending emails using SendGrid.
/// </summary>
public class SendGridEmailService
{

}