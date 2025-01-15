namespace AccountsAPIs.Entities;

public class Plan : BaseEntity,IMustHaveTenant
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the plan. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? PlanName { get; set; }

    /// <summary>
    /// Gets or sets the description of the flow. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
    /// <summary>
    /// Gets or sets the monthly price of the plan. Represented in the local currency.
    /// </summary>
    public decimal MonthlyPrice { get; set; }
    /// <summary>
    /// Gets or sets the yearly price of the plan. Represented in the local currency.
    /// </summary>
    public decimal YearlyPrice { get; set; }  

    /// <summary>
    /// Gets or sets the features of the plan. Max-1000 characters.
    /// </summary>
    [MaxLength(1000)]
    public string? Features { get; set; }
    
    [MaxLength(50)]
    public PlanStatusEnum Status { get; set; }  
    public virtual ICollection<Subscription>? Subscriptions{ get; set; }
}