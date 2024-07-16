namespace AspNetToolkit.Other;

public class JwtClaimsData
{
    public string? SessionId { get; set; }
    public string? TenantId { get; set; }
    public string? JwtId { get; set; }
    public string? IssuedAt { get; set; }
    public DateTimeOffset ValidTo { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public List<string>? UserRoles { get; set; }
}