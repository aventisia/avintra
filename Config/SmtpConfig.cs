namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for an SMTP server.
/// </summary>
public class SmtpConfig
{
    /// <summary>
    /// Gets or sets the SMTP server host name or IP address.
    /// </summary>
    public required string Host { get; set; }

    /// <summary>
    /// Gets or sets the SMTP server port number.
    /// </summary>
    public required int Port { get; set; }

    /// <summary>
    /// Gets or sets the username for SMTP authentication.
    /// </summary>
    public required string Username { get; set; }

    /// <summary>
    /// Gets or sets the password for SMTP authentication.
    /// </summary>
    public required string ApiKey { get; set; }

    /// <summary>
    /// Gets or sets the name that will appear in the "From" field of outgoing emails.
    /// </summary>
    public required string MailFromName { get; set; }

    /// <summary>
    /// Gets or sets the "From" email address used in outgoing emails.
    /// </summary>
    public required string MailFromAddress { get; set; }
}