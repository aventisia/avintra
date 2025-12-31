namespace MLModelBuilderAPIs.Enums;

/// <summary>
/// Specifies the types of operations that can be scheduled for an ML model.
/// </summary>
public enum ModelOperationTypesEnum
{
    /// <summary>
    /// Executes a model run followed by a review process.
    /// </summary>
    [Description("Run and review the ML model")]
    RunAndReview,

    /// <summary>
    /// Applies fine-tuning to the existing ML model.
    /// </summary>
    [Description("Fine-tune the ML model")]
    FineTuning,

    /// <summary>
    /// Trains a new or existing ML model.
    /// </summary>
    [Description("Train the ML model")]
    Training
}
