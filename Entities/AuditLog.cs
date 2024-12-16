namespace AccountsAPIs.Entities;
public class AuditLog
{
    public string? UserId { get; set; }
    public string? Operation {get; set; }
    public string? Input { get; set; }
    public string? Output { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}