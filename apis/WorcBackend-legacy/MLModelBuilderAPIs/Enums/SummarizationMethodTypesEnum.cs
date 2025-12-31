namespace MLModelBuilderAPIs.Enums;

/// <summary>
/// Defines the summarization strategy that the model should apply.
/// </summary>
public enum SummarizationMethodTypesEnum
{
    /// <summary>
    /// MapReduce: Processes each chunk separately and then merges the individual summaries into a final summary.
    /// Ideal for large documents where scalability and coherence are important.
    /// </summary>
    [Description("Processes chunks independently and merges their summaries into a cohesive final summary.")]
    MapReduce,

    /// <summary>
    /// Refine: Starts with an initial summary and iteratively improves it as more content is processed.
    /// Suitable for evolving or context-dependent summaries.
    /// </summary>
    [Description("Builds an initial summary and refines it incrementally with each new content chunk.")]
    Refine,

    /// <summary>
    /// Stuff: Feeds all the content at once into the model with a single prompt.
    /// Best used for short or concise inputs.
    /// </summary>
    [Description("Feeds all content into the model at once with a single summarization prompt.")]
    Stuff
}

