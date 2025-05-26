namespace AspNetToolkit.Config;

public class CronJobConfig
{
    public Dictionary<string, CronExpressionSettings>? CronJobs { get; set; }
}

public class CronExpressionSettings
{
    public string? CronExpression { get; set; }
}