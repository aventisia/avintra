namespace NodeLibrary.Core;

public class FlowMetadata
{
    public Guid Id { get; set; } = Guid.Empty;
    public string Name { get; set; } = string.Empty;
}

public class JobContext
{
    public Guid Id { get; set; } = Guid.Empty;
    public JsonNode? InputArguments { get; set; }
}

public class CallerContext
{
    public Guid TenantId { get; set; } = Guid.Empty;
    public Guid? UserId { get; set; }
    public string? AccessToken { get; set; }
}


