namespace AspNetToolkit.Entities;

/// <summary>
/// Read-only projection of the AccountsDb "TenantSubscriptions" table.
/// Used by WorkspaceAPIs to evaluate subscription renewal reminders.
/// </summary>
[Table("TenantSubscriptions")]
public class TenantSubscriptionReadOnly
{
    [Key]
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public bool IsActive { get; set; }

    /// <summary>
    /// Stored as a string in the database (e.g. "Active", "Paused", "Halted").
    /// </summary>
    public string? Status { get; set; }

    public DateTimeOffset NextBillingDate { get; set; }

    public bool IsRecurringPayment { get; set; }

    public Guid PlanId { get; set; }
}
