namespace MLModelBuilderAPIs.DTOs;

//------------------------------- Extraction Task Setup -------------------------------

/// <summary>
/// Defines an extraction task, which may include the extraction of tables and specific fields.
/// Inherits from DefaultModelSetupDto.
/// </summary>
public class ExtractionTaskDto : DefaultModelSetupDto
{
    /// <summary>
    /// Gets or sets the configuration setup for the extraction task, including details about tables and fields to extract.
    /// </summary>
    public ExtractionTaskSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Contains the configuration for an extraction task, detailing which tables and fields to extract.
/// </summary>
public class ExtractionTaskSetupDto
{
    /// <summary>
    /// Gets or sets the list of table metadata that will be extracted during the task.
    /// Each table in the list represents a table structure to be extracted from the source.
    /// </summary>
    public List<TableMetadataDto>? Tables { get; set; }

    /// <summary>
    /// Gets or sets the list of field setup configurations for the extraction task.
    /// Each field in the list represents a specific data field to be extracted.
    /// </summary>
    public List<FieldSetupDto>? Fields { get; set; }
}

//------------------------------- Summarization Task Setup -------------------------------

/// <summary>
/// Defines a summarization task with parameters for configuring the text splitting and refinement process.
/// Inherits from DefaultModelSetupDto.
/// </summary>
public class SummarizationTaskDto : DefaultModelSetupDto
{
    /// <summary>
    /// Gets or sets the setup configuration for the summarization task, which includes word count limits.
    /// </summary>
    public SummarizationTaskSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Contains configuration settings for a summarization task, including minimum and maximum word counts.
/// </summary>
public class SummarizationTaskSetupDto
{
    /// <summary>
    /// Gets or sets the minimum number of words allowed in the summary.
    /// Ensures the summary is sufficiently detailed.
    /// </summary>
    public int TotalMinimumWords { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of words allowed in the summary.
    /// Prevents the summary from being too lengthy.
    /// </summary>
    public int TotalMaximumWords { get; set; }
}

//------------------------------- Sentiment Analysis Task Setup -------------------------------

/// <summary>
/// Defines a sentiment analysis task that involves analyzing different categories of sentiment.
/// Inherits from DefaultModelSetupDto.
/// </summary>
public class SentimentAnalyticsTaskSDto : DefaultModelSetupDto
{
    /// <summary>
    /// Gets or sets the configuration setup for the sentiment analysis task.
    /// This setup contains details on how the sentiment analysis should be performed, including the categories to analyze.
    /// </summary>
    public SentimentAnalyticsTaskSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Contains the configuration setup for a sentiment analysis task, including categories of sentiment to analyze.
/// Inherits from DefaultModelSetupDto.
/// </summary>
public class SentimentAnalyticsTaskSetupDto
{
    /// <summary>
    /// Gets or sets the list of categories that define the sentiment types to analyze in the task.
    /// Each category represents a distinct sentiment type (e.g., positive, negative, neutral).
    /// </summary>
    public List<TaskSetupCategoryDto>? Categories { get; set; }
}

//------------------------------- Classification Task Setup -------------------------------

/// <summary>
/// Represents a classification task, including its setup details such as the ability to assign multiple classes
/// and the associated categories for classification.
/// </summary>
public class ClassificationTaskDto : DefaultModelSetupDto
{
    /// <summary>
    /// Represents the setup details for the classification task, including whether multiple classes can be assigned
    /// and the list of categories.
    /// </summary>
    public ClassificationTaskSetupDto? SetupObject { get; set; }
}

public class ClassificationTaskSetupDto
{
    /// <summary>
    /// Indicates whether the task allows multiple classes to be assigned to a single item.
    /// </summary>
    public bool AllowMultipleClasses { get; set; }

    /// <summary>
    /// A list of categories to be used for classification in the task.
    /// </summary>
    public List<TaskSetupCategoryDto>? Categories { get; set; }
}



//------------------------------- Question Answer Task Setup -------------------------------

/// <summary>
/// Defines a question-and-answer task that consists of multiple categorized question-and-answer pairs.
/// Inherits from DefaultModelSetupDto.
/// </summary>
public class QuestionAnswerTaskDto : DefaultModelSetupDto
{
    /// <summary>
    /// Gets or sets the configuration setup for the question-and-answer task, which includes categories of Q&A pairs.
    /// </summary>
    public QuestionAnswerTaskSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Contains the setup configuration for a question-and-answer task, including categories of questions and answers.
/// </summary>
public class QuestionAnswerTaskSetupDto
{
    /// <summary>
    /// Gets or sets the list of categorized question-and-answer entries that define the structure of the task.
    /// Each category represents a different set of related question-answer pairs.
    /// </summary>
    public List<QuestionAnswerCategoryDto>? QuestionAnswers { get; set; }
}

//------------------------------- Task Category Setup -------------------------------

/// <summary>
/// Represents a task category with subcategories and associated information.
/// </summary>
public class TaskSetupCategoryDto
{
    /// <summary>
    /// A unique identifier or sequence number used to order the category.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the category.
    /// This property is required.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the instructions related to the category.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the list of subcategories within this category.
    /// </summary>
    public List<SubcategoryTaskSetupDto>? Subcategories { get; set; }
}

/// <summary>
/// Represents a subcategory within a task category.
/// </summary>
public class SubcategoryTaskSetupDto
{
    /// <summary>
    /// A unique identifier or sequence number used to order the sub category.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the subcategory.
    /// This property is required.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the instructions related to the subcategory.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the list of sub-subcategories within this subcategory.
    /// </summary>
    public List<SubSubcategorySetupTaskDto>? SubSubcategories { get; set; }
}

/// <summary>
/// Represents a sub-subcategory within a subcategory.
/// </summary>
public class SubSubcategorySetupTaskDto
{
    /// <summary>
    /// Gets or sets unique identifier or sequence number used to order the sub-subcategory.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the sub-subcategory.
    /// This property is required.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the instructions related to the sub-subcategory.
    /// </summary>
    public string? Instructions { get; set; }
}

//------------------------------- Question Answer Category Setup -------------------------------

/// <summary>
/// Defines a single question-and-answer category, including metadata such as label, value, and optional instructions.
/// </summary>
public class QuestionAnswerCategoryDto
{
    /// <summary>
    /// A unique identifier or sequence number used to order the category.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// The descriptive name of the question or answer category.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Optional instructions providing context or guidance for the question or answer category.
    /// </summary>
    public string? Instructions { get; set; }
}
