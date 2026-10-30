namespace GlobalAdminAPIs.Entities;

/// <summary>
/// Represents the data associated with an on-premises instance.
/// This entity holds information about the instance's validation, execution statistics, 
/// and other relevant metrics for monitoring and auditing purposes.
/// </summary>
[Table("ga_OnPremInstanceData")]
public class OnPremInstanceData
{
    /// <summary>
    /// Gets or sets the unique identifier for the instance data record.
    /// This is the primary key for the data record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the instance was validated.
    /// This indicates the timestamp of the validation process.
    /// </summary>
    public DateTimeOffset ValidatedOn { get; set; }

    /// <summary>
    /// Gets or sets the name of the service that validated the instance.
    /// It could be either a background service or a startup service.
    /// </summary>
    public ValidationSourceTypesEnum ValidatedBy { get; set; }

    /// <summary>
    /// Gets or sets the number of jobs executed during the validation process.
    /// This tracks how many tasks or processes were carried out for the validation.
    /// </summary>
    public int ExecutedJobs { get; set; }

    /// <summary>
    /// Gets or sets the execution time (in milliseconds or appropriate unit) taken for the jobs executed during validation.
    /// </summary>
    public double ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the number of users involved in the instance during the validation process.
    /// </summary>
    public int Users { get; set; }

    /// <summary>
    /// Gets or sets the number of agents that were published during the validation process.
    /// </summary>
    public int PublishedAgents { get; set; }

    /// <summary>
    /// Gets or sets the foreign key for the related OnPremInstance.
    /// This links the data record to the corresponding on-prem instance.
    /// </summary>
    public required Guid OnPremInstanceId { get; set; }

    /// <summary>
    /// Gets or sets the related OnPremInstance entity.
    /// This navigation property allows access to the associated instance for the data record.
    /// </summary>
    [ForeignKey("OnPremInstanceId")]
    public virtual OnPremInstance? OnPremInstance { get; set; }
}