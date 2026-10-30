namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for an on-premises tenant, including details on the tenant's metadata,
/// platform configuration, contract information, execution settings, and audit information.
/// </summary>
public class OnPremInstanceDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the instance data record.
    /// </summary>
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
    public int ExecutionTime { get; set; }

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

}