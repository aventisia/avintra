namespace AspNetToolkit.DTOs;

public class SearchSelectOptionDto
{
    [StringLength(255)]
    public string? UserInput { get; set; }
}