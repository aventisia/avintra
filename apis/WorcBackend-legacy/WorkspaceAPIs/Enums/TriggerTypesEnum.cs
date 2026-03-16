namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing different types of triggers for a job or process.
/// </summary>
public enum TriggerTypesEnum
{
    /// <summary>
    /// No trigger type. Default value.
    /// </summary>
    [Description("No trigger type.")]
    None,

    /// <summary>
    /// Triggered manually by a user or system administrator.
    /// </summary>
    [Description("Triggered manually.")]
    ManualTrigger,

    /// <summary>
    /// Triggered by an API call or interaction.
    /// </summary>
    [Description("Triggered by an API call.")]
    APITrigger,

    /// <summary>
    /// Triggered by a webhook event.
    /// </summary>
    [Description("Triggered by a webhook.")]
    WebhookTrigger,

    /// <summary>
    /// Triggered by a queue event, such as a message or item being added to a queue.
    /// </summary>
    [Description("Triggered by a queue event.")]
    QueueTrigger,

    /// <summary>
    /// Triggered by an event, such as a specific system event or occurrence.
    /// </summary>
    [Description("Triggered by an event.")]
    EventTrigger,

    /// <summary>
    /// Triggered by a specific time, such as a scheduled time.
    /// </summary>
    [Description("Triggered by a specific time.")]
    TimeTrigger,

    /// <summary>
    /// Triggered by an incoming email.
    /// </summary>
    [Description("Triggered by an incoming email.")]
    EmailTrigger,

    /// <summary>
    /// Triggered by a chat message or chat event.
    /// </summary>
    [Description("Triggered by a chat message.")]
    MessageTrigger
}
