namespace WorkspaceAPIs.MappingProfiles;

public class WorkspaceUserMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Get record
        config.NewConfig<WorkspaceUser, WorkspaceUserDto>();

        // Mapping for inserting or updating workspace user record
        config.NewConfig<WorkspaceUserDto, WorkspaceUser>();
    }
}