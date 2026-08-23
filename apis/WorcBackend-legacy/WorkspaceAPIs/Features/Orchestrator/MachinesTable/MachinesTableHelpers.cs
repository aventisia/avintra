namespace WorkspaceAPIs.Helpers;

public static class MachinesTableHelpers
{
    /// <summary>
    /// Returns a list of distinct GUIDs from the provided list, excluding any empty GUIDs (Guid.Empty).
    /// </summary>
    /// <param name="flowVersionIds"></param>
    /// <returns></returns>
    public static List<Guid> GetDistinctGuids(List<Guid> flowVersionIds)
    {
        return flowVersionIds
            .Where(flowVersionId => flowVersionId != Guid.Empty)
            .Distinct()
            .ToList();
    }

    /// <summary>
    /// Creates a list of Machine_FlowVersion objects based on the provided machine ID and flow version IDs.
    /// Each Machine_FlowVersion object represents a relationship between the machine and a flow version.
    /// </summary>
    /// <param name="machineId"></param>
    /// <param name="flowVersionIds"></param>
    /// <returns></returns>
    public static List<Machine_FlowVersion> CreateMachineFlowVersions(Guid machineId, List<Guid> flowVersionIds)
    {
        return flowVersionIds.Select(flowVersionId => new Machine_FlowVersion
        {
            MachineId = machineId,
            FlowVersionId = flowVersionId
        }).ToList();
    }

    /// <summary>
    /// Builds a machine name based on the provided operating system, OS ID, and username.
    /// The machine name is constructed in the format: "[username]_[os]_[osId]".
    /// </summary>
    /// <param name="operatingSystem"></param>
    /// <param name="osId"></param>
    /// <param name="username"></param>
    /// <returns></returns>
    public static string BuildMachineName(
        OsTypesEnum operatingSystem,
        string osId,
        string username)
    {
        var normalizedUsername = username.Trim().ToLowerInvariant();
        var osToken = operatingSystem.ToString().ToLowerInvariant();
        var normalizedOsId = osId.Trim().ToLowerInvariant();

        return $"[{normalizedUsername}]_{osToken}_{normalizedOsId}";
    }
}
