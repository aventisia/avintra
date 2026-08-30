namespace NodeLibrary.Models;

public class DecodedJwtModel
{
    [JsonPropertyName("aud")]
    public string? Audience { get; set; }

    [JsonPropertyName("iss")]
    public string? Issuer { get; set; }

    [JsonPropertyName("exp")]
    public long ExpiryUnix { get; set; }

    [JsonPropertyName("iat")]
    public long IssuedAtUnix { get; set; }

    [JsonPropertyName("tntid")]
    public string? TenantId { get; set; }

    [JsonPropertyName("uid")]
    public string? UserId { get; set; }

    [JsonPropertyName("uname")]
    public string? UserName { get; set; }

    [JsonPropertyName("jti")]
    public string? JwtId { get; set; }

    [JsonPropertyName("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")]
    public List<string>? Roles { get; set; }

    [JsonPropertyName("sid")]
    public string? SessionId { get; set; }

    [JsonPropertyName("permissions")]
    public Dictionary<string, object>? Permissions { get; set; }
}