namespace WorkspaceAPIs.Helpers;

public static class MachinesTableHelpers
{
    public static string BuildMachineName(
        EnvironmentTypesEnum environment,
        OsTypesEnum operatingSystem,
        string osId,
        string username)
    {
        var environmentToken = environment switch
        {
            EnvironmentTypesEnum.Development => "dev",
            EnvironmentTypesEnum.Production => "prod",
            EnvironmentTypesEnum.UAT => "uat",
            _ => environment.ToString().ToLowerInvariant()
        };

        var normalizedUsername = username.Trim().ToLowerInvariant();
        var osToken = operatingSystem.ToString().ToLowerInvariant();
        var normalizedOsId = osId.Trim().ToLowerInvariant();

        return $"[{normalizedUsername}]_{environmentToken}_{osToken}_{normalizedOsId}";
    }
}
