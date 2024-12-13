namespace AccountsAPIs.DTOs;

public class SubscriptionDto
{
    /// <summary>
    /// Gets or sets the ID of the plan this subscription is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the start date of a plan subscription
    /// </summary>
    public DateTimeOffset StartDate { get; set; } 

    /// <summary>
    /// Gets or sets the due date of a plan subscription
    /// </summary>
    public DateTimeOffset DueDate { get; set; }

    
	/// <summary>
    /// Gets or sets the Id of a plan, this subscription is associated with
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription is active or not
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the Id of the user who created the record.
    /// </summary>
    public Guid? CreatedByUserId { get; set; }
}