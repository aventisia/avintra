namespace WorkspaceAPIs.DTOs;

public class FileDetailDto
{
    /// <summary>
    /// Gets or sets the name of Uploaded file. Max character is 255.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of uploaded file. 
    /// </summary>
    public string? Extension { get; set; }

    /// <summary>
    /// Gets or sets the size of uploaded file. 
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets file properties of an uploaded doc
    /// </summary>
    public IFormFile? File { get; set; }

    /// <summary>
    /// Gets or sets the path of uploaded file. 
    /// </summary>
    public required string Path { get; set; }
}