namespace AspNetToolkit.Entities;

/// <summary>
/// Read-only projection of the AccountsDb "TenantCredits" table.
/// Used by WorkspaceAPIs to evaluate low-credit notifications.
/// </summary>
[Table("TenantCredits")]
public class TenantCreditReadOnly
{
    [Key]
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public double AvailableCredits { get; set; }

    public DateTimeOffset CreditedOn { get; set; }

    public DateTimeOffset ExpiredOn { get; set; }

    /// <summary>
    /// Stored as a string in the database (e.g. "Subscription", "Top-up", "Addon").
    /// </summary>
    public string? Type { get; set; }

    public Guid SubscriptionId { get; set; }
}
