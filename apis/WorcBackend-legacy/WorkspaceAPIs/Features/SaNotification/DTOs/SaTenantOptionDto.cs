namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Lightweight tenant option used by the Super Admin notification audience picker.
/// </summary>
public class SaTenantOptionDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
}
