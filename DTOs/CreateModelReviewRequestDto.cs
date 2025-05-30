namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Request DTO for creating a review associated with an ML model.
/// </summary>
public class CreateModelReviewRequestDto
{
    /// <summary>
    /// List of file IDs to be uploaded.
    /// </summary>
    public required List<Guid> FileIds { get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>
    public required Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the type of extra
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Gets or sets the scheduling details for the review.
    /// </summary>
    public ScheduleInfoDto? ScheduleInfo { get; set; }
}

/// <summary>
/// DTO containing scheduling details for a model review.
/// </summary>
public class ScheduleInfoDto
{
    /// <summary>
    /// Time zone in which the schedule is specified.
    /// </summary>
    public required string TimeZone { get; set; }

    /// <summary>
    /// The date and time when the review is scheduled.
    /// </summary>
    public required DateTime ScheduledAt { get; set; }
}
