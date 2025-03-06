using Newtonsoft.Json;

namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents an extracted field 
/// </summary>
public class ExtractedFieldDto
{
    /// <summary>
    /// Gets or sets field identifier from json string
    /// </summary>
    [JsonProperty("fieldId")]
    public string? FieldId { get; set; }

    /// <summary>
    /// Gets or sets page number from json string
    /// </summary>
    [JsonProperty("pageNumber")]
    public int? PageNumber { get; set; }

    /// <summary>
    /// Gets or sets field name from json string
    /// </summary>
    [JsonProperty("fieldName")]
    public string? FieldName { get; set; }

    /// <summary>
    /// Gets or sets image path from json string
    /// </summary>
    [JsonProperty("imgPath")]
    public string? ImgPath { get; set; }

    /// <summary>
    /// Gets or sets field value from json string
    /// </summary>
    [JsonProperty("value")]
    public string? Value { get; set; }

}