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

    private string? _accessToken;

    /// <summary>
    /// The bearer token nodes use for outbound backend calls. When <see cref="AccessTokenProvider"/>
    /// is set, reads resolve through it so long-running flows pick up refreshed machine JWTs.
    /// </summary>
    public string? AccessToken
    {
        get => AccessTokenProvider is not null ? AccessTokenProvider() : _accessToken;
        set => _accessToken = value;
    }

    /// <summary>
    /// Optional callback invoked on each AccessToken read so runners can supply a fresh token
    /// (e.g. after a machine JWT refresh) without reseeding the execution context.
    /// </summary>
    public Func<string?>? AccessTokenProvider { get; set; }

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

    /// <summary>
    /// The space of the executing flow, forwarded as "X-Space-Id" on outbound backend calls
    /// so space-scoped resources resolve. Null means the Central space.
    /// </summary>
    public Guid? SpaceId { get; set; }
}


