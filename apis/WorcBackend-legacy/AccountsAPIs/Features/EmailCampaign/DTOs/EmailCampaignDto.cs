namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a request to add a campaign-recipient mapping.
/// </summary>
public class EmailCampaignDto
{
    /// <summary>
    /// Gets or sets the campaign ID (cid). Max-20.
    /// </summary>
    [StringLength(20)]
    public required string Cid { get; set; }

    /// <summary>
    /// Gets or sets the recipient ID (rid). Max-20.
    /// </summary>
    [StringLength(20)]
    public required string Rid { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;
}
