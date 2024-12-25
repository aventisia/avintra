namespace AccountsAPIs.DTOs;

public class PlanDto
{
    public Guid Id { get; set; }
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
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; } = false;
}