/// <summary>
/// Represents an event that occurred during the lifecycle of a queue transaction.
/// </summary>
[Table("worc_QueueTransactionEvents")]
public class QueueTransactionEvent : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of event that occurred for the queue transaction.
    /// </summary>
    public QueueTransactionEventEnum EventType { get; set; }

    /// <summary>
    /// Gets or sets the event payload data.
    /// </summary>
    // TODO: Replace string with a strongly typed object or JSON document (e.g., JsonDocument/JsonNode)
    // once the event payload schema is finalized.
    public required string Data { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated queue transaction.
    /// </summary>
    public required Guid QueueTransactionId { get; set; }

    /// <summary>
    /// Navigation property for the associated queue transaction.
    /// </summary>
    [ForeignKey(nameof(QueueTransactionId))]
    public virtual QueueTransaction? QueueTransaction { get; set; }
}