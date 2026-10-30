namespace GlobalAdminAPIs.Extensions;

public static class EnvironmentConfigurationExtensions
{
    /// <summary>
    /// Loads .env.local into process environment before Kestrel binds ports.
    /// </summary>
    public static void LoadDotEnvForKestrel()
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
        if (environment != "Localhost")
            return;
        LoadDotEnvLocal();
    }

    /// <summary>
    /// Loads required and optional settings from environment variables and merges them with existing configuration.
    /// </summary>
    public static IConfigurationRoot LoadEnvironmentConfiguration(
        this IConfigurationRoot config,
        bool isLocalhostEnvironment
    )
    {
        if (isLocalhostEnvironment)
        {
            LoadDotEnvLocal();
        }

        var POSTGRESQL_HOST = GetRequiredEnvVar("POSTGRESQL_HOST");
        var POSTGRESQL_PORT = Environment.GetEnvironmentVariable("POSTGRESQL_PORT") ?? config["EnvironmentConfig:PostgresqlPort"] ?? "5432";
        var POSTGRESQL_USERNAME = GetRequiredEnvVar("POSTGRESQL_USERNAME");
        var POSTGRESQL_PASSWORD = GetRequiredEnvVar("POSTGRESQL_PASSWORD");

        var JWT_SECRET_KEY = GetRequiredEnvVar("JWT_SECRET_KEY");

        var SMTP_HOST = Environment.GetEnvironmentVariable("SMTP_HOST") ?? string.Empty;
        var SMTP_PORT = Environment.GetEnvironmentVariable("SMTP_PORT") ?? "0";
        var SMTP_USER = Environment.GetEnvironmentVariable("SMTP_USER") ?? string.Empty;
        var SMTP_PASSWORD = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? string.Empty;
        var SMTP_MAIL_FROM_NAME = Environment.GetEnvironmentVariable("SMTP_MAIL_FROM_NAME") ?? string.Empty;
        var SMTP_MAIL_FROM_ADDRESS = Environment.GetEnvironmentVariable("SMTP_MAIL_FROM_ADDRESS") ?? string.Empty;

        return new ConfigurationBuilder()
            .AddConfiguration(config)
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "EnvironmentConfig:PostgresqlHost", POSTGRESQL_HOST },
                { "EnvironmentConfig:PostgresqlPort", POSTGRESQL_PORT },
                { "EnvironmentConfig:PostgresqlUsername", POSTGRESQL_USERNAME },
                { "EnvironmentConfig:PostgresqlPassword", POSTGRESQL_PASSWORD },

                { "EnvironmentConfig:JwtSecretKey", JWT_SECRET_KEY },

                { "EnvironmentConfig:SmtpHost", SMTP_HOST },
                { "EnvironmentConfig:SmtpPort", SMTP_PORT },
                { "EnvironmentConfig:SmtpUser", SMTP_USER },
                { "EnvironmentConfig:SmtpPassword", SMTP_PASSWORD },
                { "EnvironmentConfig:SmtpMailFromName", SMTP_MAIL_FROM_NAME },
                { "EnvironmentConfig:SmtpMailFromAddress", SMTP_MAIL_FROM_ADDRESS },
            })
            .Build();
    }

    private static string GetRequiredEnvVar(string key)
    {
        return Guard.Against.NullOrWhiteSpace(
            Environment.GetEnvironmentVariable(key),
            message: $"{key} environment variable cannot be null or empty"
        );
    }

    private static void LoadDotEnvLocal()
    {
        var envLocalPath = Path.Combine(Directory.GetCurrentDirectory(), ".env.local");
        if (!File.Exists(envLocalPath))
        {
            return;
        }

        foreach (var line in File.ReadAllLines(envLocalPath))
        {
            var trimmedLine = line.Trim();
            if (trimmedLine.Length == 0 || trimmedLine.StartsWith('#'))
            {
                continue;
            }

            var separatorIndex = trimmedLine.IndexOf('=');
            if (separatorIndex <= 0)
            {
                continue;
            }

            var key = trimmedLine[..separatorIndex].Trim();
            var value = trimmedLine[(separatorIndex + 1)..].Trim();
            if (value.Length >= 2 && (value[0] == '"' || value[0] == '\'') && value[^1] == value[0])
            {
                value = value[1..^1];
            }

            // IMPORTANT NOTE: shell/session exports must win over the file, matching DotNetEnv's no-overwrite load.
            if (Environment.GetEnvironmentVariable(key) is null)
            {
                Environment.SetEnvironmentVariable(key, value);
            }
        }
    }
}
