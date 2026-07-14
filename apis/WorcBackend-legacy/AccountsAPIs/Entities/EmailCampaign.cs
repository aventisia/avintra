namespace AccountsAPIs.Entities;

/// <summary>
/// Represents an email campaign recipient mapping record.
/// </summary>
[Table("EmailCampaign")]
public class EmailCampaign
{
    /// <summary>
    /// Gets or sets the email campaign record primary key in Guid format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the campaign ID. Max-20 characters.
    /// </summary>
    [MaxLength(20)]
    public required string CampaignID { get; set; }

    /// <summary>
    /// Gets or sets the recipient ID. Max-20 characters.
    /// </summary>
    [MaxLength(20)]
    public required string RecipientID { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the version number used for row versioning.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}
