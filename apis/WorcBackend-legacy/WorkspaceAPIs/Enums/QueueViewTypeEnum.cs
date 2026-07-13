namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the business context or intended use of a queue.
/// This value is used to categorize queues and tailor their presentation
/// and behavior in the user interface, independent of their technical type.
/// </summary>
public enum QueueViewTypeEnum
{
    /// <summary>
    /// Indicates that the queue is intended for document processing workflows.
    /// </summary>
    [Description("Document Processing")]
    DocumentProcessing,

    /// <summary>
    /// Indicates that the queue is intended for email processing workflows.
    /// </summary>
    [Description("Email Processing")]
    EmailProcessing,

    /// <summary>
    /// Reserved for additional queue view types.
    /// </summary>
    // TODO: Add more queue view types as new business scenarios are introduced.
}