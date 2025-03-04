namespace MLModelBuilderAPIs.Dtos;

public class CheckFieldNameAvailabilityDto
{
    /// <summary>
    /// Gets or sets user input
    /// </summary>
    public required string UserInput { get; set;}

    /// <summary>
    /// Gets or sets ML model Identifier
    /// </summary>
    public required Guid MLModelId { get; set;}
}