namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO containing subscription-specific configuration for an message trigger.
/// This includes mailbox, folder, expiration, resubscription settings, and provider details.
/// </summary>
public class MessageTriggerModel
{
    /// <summary>
    /// Gets or sets the resource path for the message trigger subscription. Defaults to "/chats/getAllMessages".
    /// </summary>
    public string Resource { get; set; } = "/chats/getAllMessages";

    /// <summary>
    /// Gets or sets the mailbox associated with the message trigger.
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// Gets or sets the subscription expiration date and time for the message trigger.
    /// </summary>
    [Required]
    public DateTimeOffset ExpiryDateTime { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether automatic resubscription is enabled for the message trigger.
    /// </summary>
    public bool ResubscribeEnabled { get; set; }

    /// <summary>
    /// Gets or sets the frequency at which the system attempts to resubscribe (in days).
    /// </summary>
    public int? ResubscribeFrequency { get; set; } // Number of days, e.g., 30, 90, 180, 365

    /// <summary>
    /// Gets or sets the subscription ID created by the message provider (Outlook/Gmail). This is used to track and manage the subscription.
    /// </summary>
    public string? SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential used for authentication.
    /// </summary>
    [Required]
    public Guid CredentialId { get; set; }

    /// <summary>
    /// Gets or sets the provider associated with the message trigger. Defaults to Microsoft 365.
    /// </summary>
    public TriggerProviderTypesEnum Provider { get; set; } = TriggerProviderTypesEnum.M365;

    /// <summary>
    /// Gets or sets the API key used for authenticating incoming trigger requests.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

}