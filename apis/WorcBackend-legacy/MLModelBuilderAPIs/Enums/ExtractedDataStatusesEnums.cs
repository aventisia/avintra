namespace MLModelBuilderAPIs.Enums;

public enum ExtractedDataStatusesEnums
{
    /// <summary>
    /// The data extraction process is still pending.
    /// </summary>
    [Description("Pending")]
    Pending,

    /// <summary>
    /// The data has been successfully extracted.
    /// </summary>
    [Description("Extracted")]
    Extracted,

    /// <summary>
    /// The extracted data is currently under review.
    /// </summary>
    [Description("Reviewed")]
    Reviewed,

    /// <summary>
    /// The extracted data is being fine-tuned for accuracy.
    /// </summary>
    [Description("Fine Tuning")]
    FineTuning,

    /// <summary>
    /// The extracted data has been approved.
    /// </summary>
    [Description("Approved")]
    Approved,

    /// <summary>
    /// The extracted data has been rejected.
    /// </summary>
    [Description("Rejected")]
    Rejected,

    /// <summary>
    /// The data extraction process has been completed successfully.
    /// </summary>
    [Description("Completed")]
    Completed,

    /// <summary>
    /// An error occurred during the data extraction process.
    /// </summary>
    [Description("Error")]
    Error
}
