namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents the data transfer object (DTO) used to check the availability of a user input.
/// </summary>
public class CheckAvailabilityDto
{
    /// <summary>
    /// Gets or sets the user input to check for availability.
    /// </summary>
    [StringLength(255)]
    public required string UserInput { get; set; }
}
