namespace MLModelBuilderAPIs.Entities;

public class LLM : BaseEntity
{
    /// <summary>
    /// Gets or sets the name of LLM. Max character is 50.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }
}