namespace AccountsAPIs.DTOs;

public class PlanListDto
{
    //public Guid Id { get; set; }
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
    /// Gets or sets the features of the plan. Max-1000 characters.
    /// </summary>
    [MaxLength(1000)]
    public string? Features { get; set; }

    
}