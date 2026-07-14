namespace WorkspaceAPIs.Helpers;

public static class MachineHelpers
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

        var osToken = operatingSystem.ToString().ToLowerInvariant();
        var normalizedOsId = osId.Trim().ToLowerInvariant();

        return $"[{username.Trim()}]_{environmentToken}_{osToken}_{normalizedOsId}";
    }
}
