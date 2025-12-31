namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Configuration template for a machine learning model, defining key settings for tasks like data extraction, classification, summarization, sentiment analysis, and question answering.
/// </summary>
public class AIModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the model's name.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the model's description.
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the business context the model addresses.
    /// </summary>
    public required string BusinessContext { get; set; }

    /// <summary>
    /// Gets or sets the configuration for data extraction.
    /// </summary>
    public DataExtractionTemplateConfigDto? Extraction { get; set; }

    /// <summary>
    /// Gets or sets the configuration for text classification.
    /// </summary>
    public ClassificationTemplateConfigDto? Classification { get; set; }

    /// <summary>
    /// Gets or sets the configuration for text summarization.
    /// </summary>
    public SummarizationTemplateConfigDto? Summarization { get; set; }

    /// <summary>
    /// Gets or sets the configuration for sentiment analysis.
    /// </summary>
    public SentimentAnalysisTemplateConfigDto? SentimentAnalytics { get; set; }

    /// <summary>
    /// Gets or sets the configuration for question answering.
    /// </summary>
    public QuestionAnsweringTemplateConfigDto? QuestionAnswer { get; set; }

    // TODO: Add Conversational and Generative model also
}

/// <summary>
/// Base configuration for any model task, defining settings like task name, model type, configuration type, prompts, and temperature (randomness control).
/// </summary>
public class BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the task name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Indicates whether the on-premises LLM (Large Language Model) is used.
    /// </summary>
    /// <remarks>
    /// If <see cref="IsBYOKEnabled"/> is false, the cloud provider LLM will be utilized for this task.
    /// </remarks>
    public bool IsBYOKEnabled { get; set; }
    /// <summary>
    /// Gets or sets the model type.
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the secret key (optional).
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the node prompt to guide the model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature for randomness control.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the generated prompt based on the task setup.
    /// </summary>
    public string? GeneratedPrompt { get; set; }
}

//------------------------------- Data Extraction Task -------------------------------

/// <summary>
/// Template configuration for a data extraction task, specifying the tables and fields to be extracted from structured data.
/// </summary>
public class DataExtractionTemplateConfigDto : BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the configuration for the data extraction task, including tables and fields to extract.
    /// </summary>
    public DataExtractionTemplateConfigDetailsDto? SetupObject { get; set; }
}

/// <summary>
/// Detailed configuration for a data extraction task, specifying which tables and fields to extract.
/// </summary>
public class DataExtractionTemplateConfigDetailsDto
{
    /// <summary>
    /// Gets or sets the list of tables to be extracted.
    /// </summary>
    public List<TableMetadataDto>? Tables { get; set; }

    /// <summary>
    /// Gets or sets the list of fields to be extracted.
    /// </summary>
    public List<FieldSetupDto>? Fields { get; set; }
}

//------------------------------- Text Summarization Task -------------------------------

/// <summary>
/// Template configuration for a text summarization task, specifying word count limits for the summary.
/// </summary>
public class SummarizationTemplateConfigDto : BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the configuration for the text summarization task, including word count limits.
    /// </summary>
    public SummarizationTemplateConfigDetailsDto? SetupObject { get; set; }
}

/// <summary>
/// Detailed configuration for a text summarization task, including minimum and maximum word count limits.
/// </summary>
public class SummarizationTemplateConfigDetailsDto
{
    /// <summary>
    /// Gets or sets the minimum word count for the summary.
    /// </summary>
    public int TotalMinimumWords { get; set; }

    /// <summary>
    /// Gets or sets the maximum word count for the summary.
    /// </summary>
    public int TotalMaximumWords { get; set; }
}

//------------------------------- Sentiment Analysis Task -------------------------------

/// <summary>
/// Template configuration for a sentiment analysis task, specifying sentiment categories (positive, negative, neutral).
/// </summary>
public class SentimentAnalysisTemplateConfigDto : BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the configuration for the sentiment analysis task, including sentiment categories.
    /// </summary>
    public SentimentAnalysisTemplateConfigDetailsDto? SetupObject { get; set; }
}

/// <summary>
/// Detailed configuration for sentiment analysis, including the sentiment categories (positive, negative, neutral) to analyze.
/// </summary>
public class SentimentAnalysisTemplateConfigDetailsDto
{
    /// <summary>
    /// Gets or sets the list of sentiment categories to analyze.
    /// </summary>
    public List<TaskTemplateCategoryDto>? Categories { get; set; }
}

//------------------------------- Text Classification Task -------------------------------

/// <summary>
/// Template configuration for a text classification task, including options for multiple class assignments and predefined categories.
/// </summary>
public class ClassificationTemplateConfigDto : BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the configuration for the classification task, including class assignment options and categories.
    /// </summary>
    public ClassificationTemplateConfigDetailsDto? SetupObject { get; set; }
}

/// <summary>
/// Detailed configuration for a classification task, including whether multiple classes can be assigned to one item and the categories for classification.
/// </summary>
public class ClassificationTemplateConfigDetailsDto
{
    /// <summary>
    /// Indicates if multiple classes can be assigned to a single item.
    /// </summary>
    public bool AllowMultipleClasses { get; set; }

    /// <summary>
    /// List of categories for classification.
    /// </summary>
    public List<TaskTemplateCategoryDto>? Categories { get; set; }
}

//------------------------------- Question Answering Task -------------------------------

/// <summary>
/// Template configuration for a question-answering task, specifying how question-answer pairs are categorized.
/// </summary>
public class QuestionAnsweringTemplateConfigDto : BaseModelTemplateConfigDto
{
    /// <summary>
    /// Gets or sets the configuration for the question-answering task, including categories for Q&A pairs.
    /// </summary>
    public QuestionAnsweringTemplateConfigDetailsDto? SetupObject { get; set; }
}

/// <summary>
/// Detailed configuration for a question-answering task, including categories and specific Q&A pairs.
/// </summary>
public class QuestionAnsweringTemplateConfigDetailsDto
{
    /// <summary>
    /// Gets or sets the categorized question-answer pairs for the task.
    /// </summary>
    public List<QuestionAnswerCategoryDto>? QuestionAnswers { get; set; }
}

/// <summary>
/// Represents a task category, with instructions and subcategories.
/// </summary>
public class TaskTemplateCategoryDto
{
    /// <summary>
    /// Gets or sets the category name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets specific instructions for this category.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the list of subcategories for this category.
    /// </summary>
    public List<TaskTemplateSubcategoryDto>? SubCategories { get; set; }
}

/// <summary>
/// Represents a subcategory within a task category.
/// </summary>
public class TaskTemplateSubcategoryDto
{
    /// <summary>
    /// Gets or sets the subcategory name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets specific instructions for this subcategory.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the list of sub-subcategories under this subcategory.
    /// </summary>
    public List<TaskTemplateDetailDto>? SubSubCategories { get; set; }
}

/// <summary>
/// Represents a detailed task subcategory under a task subcategory.
/// </summary>
public class TaskTemplateDetailDto
{
    /// <summary>
    /// Gets or sets the detailed task name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets specific instructions for this detailed task.
    /// </summary>
    public string? Instructions { get; set; }
}
