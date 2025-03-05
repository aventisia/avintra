namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the possible statuses for a queue transaction.
/// </summary>
public enum QueueTransactionStatusTypesEnum
{
    /// <summary>
    /// Indicates that the transaction is pending and has not started processing.
    /// </summary>
    [Description("Pending")]
    Pending,

    /// <summary>
    /// Indicates that the transaction is currently being processed.
    /// </summary>
    [Description("In Progress")]
    InProgress,

    /// <summary>
    /// Indicates that the transaction has been completed successfully.
    /// </summary>
    [Description("Completed")]
    Completed,

    /// <summary>
    /// Indicates that the transaction has failed during processing.
    /// </summary>
    [Description("Failed")]
    Failed
}