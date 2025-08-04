namespace MLModelBuilderAPIs.DTOs;

// ------------------------------- Extraction Task -------------------------------

/// <summary>
/// Contains extracted fields and tables from the document for an extraction task.
/// </summary>
public class ExtractionTaskExtractedDataDto
{
    /// <summary>
    /// Gets or sets the list of extracted fields from the document.
    /// </summary>
    public List<ExtractionFieldDto>? Fields { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted tables from the document.
    /// </summary>
    public List<ExtractionTableDto>? Tables { get; set; }
}

/// <summary>
/// Represents an extracted field from the document with name, value, and confidence score.
/// </summary>
public class ExtractionFieldDto
{
    /// <summary>
    /// Gets or sets the name of the extracted field.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value of the extracted field.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the extracted field.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}

/// <summary>
/// Represents an extracted table from the document with its name and headers.
/// </summary>
public class ExtractionTableDto
{
    /// <summary>
    /// Gets or sets the name of the extracted table.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of headers for the extracted table.
    /// </summary>
    public List<ExtractionSetupTableHeaderSchema>? Headers { get; set; }
}

/// <summary>
/// Represents a table header and its associated values.
/// </summary>
public class ExtractionExtractedTableHeaderSchema
{
    /// <summary>
    /// Gets or sets the name of the table column header.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of values under the column header.
    /// </summary>
    public List<string>? Values { get; set; }
}

// ------------------------------- Summarization Task -------------------------------

/// <summary>
/// Represents the result of a summarization task, which includes the summarized text.
/// </summary>
public class SummarizationTaskExtractedDataDto
{
    /// <summary>
    /// Gets or sets the summary of the document.
    /// </summary>
    public string? Summary { get; set; }
}

// ------------------------------- Sentiment Analytics Task -------------------------------

/// <summary>
/// Represents the extracted data from a sentiment analysis task, including sentiment categories.
/// </summary>
public class SentimentAnalysisExtractedDataDto : CategoryExtractedDataDto
{
    // Inherits properties related to sentiment analysis.
}

// ------------------------------- Classification Task -------------------------------

/// <summary>
/// Represents the extracted data for a classification task, including classification categories.
/// </summary>
public class ClassificationTaskExtractedDataDto : CategoryExtractedDataDto
{
    // Inherits properties related to classification categories.
}

// ------------------------------- Question-Answer Task -------------------------------

/// <summary>
/// Represents a single question-answer pair’s extracted data.
/// </summary>
public class QuestionAnswerTaskExtractedDataDto
{
    /// <summary>
    /// Gets or sets the question.
    /// </summary>
    public required string Question { get; set; }

    /// <summary>
    /// Gets or sets the answer to the question.
    /// </summary>
    public string? Answer { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the question-answer pair.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}

// ------------------------------- Base Category and Subcategory Structures -------------------------------

/// <summary>
/// Represents the base structure for category-based extracted data.
/// </summary>
public abstract class CategoryExtractedDataDto
{
    /// <summary>
    /// Gets or sets the name of the category.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value associated with the category.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the category.
    /// </summary>
    public string? ConfidenceScore { get; set; }

    /// <summary>
    /// Gets or sets the list of subcategories under this category.
    /// </summary>
    public List<SubcategoryExtractedDataDto>? SubCategories { get; set; }
}

/// <summary>
/// Represents a subcategory within a category, with associated values and confidence score.
/// </summary>
public class SubcategoryExtractedDataDto
{
    /// <summary>
    /// Gets or sets the name of the subcategory.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value associated with the subcategory.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the subcategory.
    /// </summary>
    public string? ConfidenceScore { get; set; }

    /// <summary>
    /// Gets or sets the list of sub-subcategories under this subcategory.
    /// </summary>
    public List<SubSubcategoryExtractedDataDto>? SubSubCategories { get; set; }
}

/// <summary>
/// Represents a sub-subcategory within a subcategory, with associated values and confidence score.
/// </summary>
public class SubSubcategoryExtractedDataDto
{
    /// <summary>
    /// Gets or sets the name of the sub-subcategory.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value associated with the sub-subcategory.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the sub-subcategory.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}

public class CategoryDataDto
{
    /// <summary>
    /// Gets or sets the name of the category.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value associated with the category.
    /// </summary>
    [JsonConverter(typeof(ToStringConverter))]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score for the category.
    /// </summary>
    [JsonConverter(typeof(ToStringConverter))]
    public string? ConfidenceScore { get; set; }
}