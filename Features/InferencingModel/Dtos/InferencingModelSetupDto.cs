namespace MLModelBuilderAPIs.DTOs
{
    /// <summary>
    /// Represents an extraction task, which can contain tables and field setups.
    /// </summary>
    public class ExtractionTaskDto
    {
        /// <summary>
        /// A list of table metadata to be extracted in the task.
        /// </summary>
        public List<TableMetadataDto>? Tables { get; set; }

        /// <summary>
        /// A list of field setup configurations for the extraction task.
        /// </summary>
        public List<FieldSetupDto>? Fields { get; set; }
    }

    /// <summary>
    /// Represents a summarization task with various parameters for splitting and refining the text.
    /// </summary>
    public class SummarizationTaskDto
    {
        /// <summary>
        /// The number of characters allowed per chunk in the summarization task.
        /// </summary>
        public int CharactersPerChunk { get; set; } = 0;

        /// <summary>
        /// The number of overlapping characters between chunks in the summarization task.
        /// </summary>
        public int ChunkOverlap { get; set; } = 0;

        /// <summary>
        /// The minimum total number of words allowed in the summary.
        /// </summary>
        public int TotalMinimumWords { get; set; }

        /// <summary>
        /// The maximum total number of words allowed in the summary.
        /// </summary>
        public int TotalMaximumWords { get; set; }

        /// <summary>
        /// The type of summarization method to be used.
        /// </summary>
        public SummarizationMethodTypesEnum? SummarizationMethod { get; set; }

        /// <summary>
        /// A custom prompt for mapping individual summaries.
        /// </summary>
        public string? MapIndividualSummaryPrompt { get; set; }

        /// <summary>
        /// A custom prompt for combining individual summaries into a final summary.
        /// </summary>
        public string? MapFinalCombinePrompt { get; set; }

        /// <summary>
        /// A custom prompt for refining the initial summary.
        /// </summary>
        public string? RefineInitialPrompt { get; set; }

        /// <summary>
        /// A custom prompt for refining subsequent summaries after the initial one.
        /// </summary>
        public string? RefineSubsequentPrompt { get; set; }

        /// <summary>
        /// A custom prompt for a "stuffing" operation, usually related to merging or including extra information.
        /// </summary>
        public string? StuffPrompt { get; set; }
    }

    /// <summary>
    /// Represents a sentiment analysis task with categories of sentiment to analyze.
    /// </summary>
    public class SentimentAnalyticTaskDto
    {
        /// <summary>
        /// A list of categories that define the different sentiment types to be analyzed.
        /// </summary>
        public List<TaskCategoryDto>? Categories { get; set; }
    }

    /// <summary>
    /// Represents a question and answer task with categories defining the questions and their answers.
    /// </summary>
    public class QuestionAnswerTaskDto
    {
        /// <summary>
        /// A list of categories defining different question-answer sets for the task.
        /// </summary>
        public List<TaskCategoryDto>? QuestionAnswers { get; set; }
    }

    /// <summary>
    /// Represents a classification task with options for multiple classes and categories to classify.
    /// </summary>
    public class ClassificationTaskDto
    {
        /// <summary>
        /// Indicates whether the task allows multiple classes to be assigned to a single item.
        /// </summary>
        public bool AllowMultipleClasses { get; set; }

        /// <summary>
        /// A list of categories to be used for classification in the task.
        /// </summary>
        public List<TaskCategoryDto>? Categories { get; set; }
    }

    /// <summary>
    /// Represents a category within a task. This could define the task’s input and output categories.
    /// </summary>
    public class TaskCategoryDto
    {
        /// <summary>
        /// An index or identifier for the category.
        /// </summary>
        public string Index { get; set; } = string.Empty;

        /// <summary>
        /// The name of the category.
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Additional instructions related to the category, if any.
        /// </summary>
        public string? Instructions { get; set; }
    }
}
