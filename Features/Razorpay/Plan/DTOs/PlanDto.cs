namespace AccountsAPIs.DTOs;

/// <summary>
/// DTO for requesting a subscription plan.
/// </summary>
public class PlanRequestDto
{
    /// <summary>
    /// Gets or sets the frequency period of the subscription (e.g., Monthly, Yearly).
    /// </summary>
    [Required]
    public required string Period { get; set; }

    /// <summary>
    /// Gets or sets the interval for the subscription frequency. Default is 1.
    /// </summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Gets or sets optional metadata for the plan item as a dictionary of key-value pairs.
    /// </summary>
    public Dictionary<string, string>? Notes { get; set; }

    /// <summary>
    /// Gets or sets the plan item details.
    /// </summary>
    [Required]
    public required PlanItemDto Item { get; set; }

}

/// <summary>
/// DTO representing a single plan item with pricing and metadata.
/// </summary>
public class PlanItemDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the plan item.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the plan item (e.g., "Basic Plan").
    /// </summary>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the plan item.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the price amount of the plan in smallest currency unit (e.g., cents).
    /// </summary>
    [Required]
    public int Amount { get; set; }

    /// <summary>
    /// Gets or sets the currency type of the plan amount.
    /// </summary>
    [Required]
    public required string Currency { get; set; }
}

/// <summary>
/// DTO for returning a subscription plan response.
/// </summary>
public class PlanResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the created plan.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Gets or sets the frequency period of the plan.
    /// </summary>
    public required string Period { get; set; }

    /// <summary>
    /// Gets or sets the interval of the subscription frequency.
    /// </summary>
    public required int Interval { get; set; }

    /// <summary>
    /// Gets or sets the plan item details. Can be null.
    /// </summary>
    public PlanItemDto? Item { get; set; }

    /// <summary>
    /// Gets or sets optional metadata for the plan item as a dictionary of key-value pairs.
    /// </summary>
    public Dictionary<string, string>? Notes { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the plan was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
