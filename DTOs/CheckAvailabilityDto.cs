namespace AspNetToolkit.DTOs;

public class CheckAvailabilityDto
{
    [StringLength(255)]
    public required string UserInput { get; set; }
}