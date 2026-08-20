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

    /// <summary>
    /// The resolved application base URL (e.g., avintra.aventisia.com) supplied by the runner.
    /// </summary>
    public string? AppBaseUrl { get; set; }

    /// <summary>
    /// The deployment environment of the executing flow ("dev" or "prod"), derived from the
    /// flow's publication status (published → "prod", otherwise "dev"). Nodes forward this as
    /// the "X-Env-Type" header on outbound backend calls so resources resolve in the same env.
    /// Defaults to "dev" when not supplied.
    /// </summary>
    public string EnvType { get; set; } = "dev";
}


