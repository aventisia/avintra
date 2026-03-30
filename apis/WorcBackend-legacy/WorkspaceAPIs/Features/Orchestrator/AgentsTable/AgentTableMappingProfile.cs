namespace WorkspaceAPIs.MappingProfiles
{
    public class AgentTableMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Mapping of DTO to get list of versions to show on the UI.
            config.NewConfig<FlowVersion, AgentTableDto>()
                .Map(dest => dest.RefId, src => src.FlowId)
                .Map(dest => dest.MachineCount, src => src.MachineFlows != null ? src.MachineFlows.Count() : 0)
                .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
                .Map(dest => dest.Type, src => src.Flow != null ? src.Flow.Type.ToString() : FlowTypesEnum.Agent.ToString()) // Preserve actual flow type (Agent/ChatAgent), fallback to Agent when flow is unavailable.
                .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
                .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null)
                .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);

            // Mapping to get agent list
            config.NewConfig<MachineFlow, AssignMachineDto>()
                .Map(dest => dest.Id, src => src.MachineId)
                .Map(dest => dest.AgentId, src => src.FlowVersionId)
                .Map(dest => dest.IsAssigned, src => true)
                .Map(dest => dest.Name, src => src.Machine != null ? src.Machine.Name : string.Empty)
                .Map(dest => dest.OSId, src => src.Machine != null ? src.Machine.OSId : string.Empty)
                .Map(dest => dest.Status, src => src.Machine != null ? src.Machine.Status : MachineStatusTypeEnum.Offline)
                .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
                .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);

            // New Mapping for Agents to SelectOptionDto (For dropdowns or select lists)
        }
    }
}