namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// DTO for submitting a fine-tuning request for an existing ML model.
/// </summary>
public class AddFineTuningRequestDto
{
    /// <summary>
    /// List of file identifiers to be used for fine-tuning.
    /// </summary>
    public required List<Guid> FileIds { get; set; }

    /// <summary>
    /// Identifier of the ML model to which the fine-tuning request is linked.
    /// </summary>
    public required Guid MLModelId { get; set; }

    /// <summary>
    /// Time zone context for the scheduled fine-tuning.
    /// </summary>
    public required string TimeZone { get; set; }

    /// <summary>
    /// Scheduled date and time for initiating the fine-tuning process.
    /// </summary>
    public required DateTime ScheduledAt { get; set; }
}
