namespace AspNetToolkit.DTOs;

public class ServiceItemDto
{
    public required string DisplayName { get; set; }
    public required string Name { get; set; }
    public string? IconSrc { get; set; }
}