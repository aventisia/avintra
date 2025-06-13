namespace MLModelBuilderAPIs.Enums;

/// <summary>
/// Represents the stage of a document workflow.
/// Each stage combines two sequential steps in the process.
/// </summary>
public enum DocumentStageTypesEnum
{
    /// <summary>
    /// Represents the Setup and Test stage of the document workflow.
    /// Typically used for initial configuration and validation.
    /// </summary>
    SetupTest,

    /// <summary>
    /// Represents the Run and Review stage of the document workflow.
    /// Typically used for executing and evaluating the document's content or logic.
    /// </summary>
    RunReview
}
