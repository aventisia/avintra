namespace WorkspaceAPIs.MappingProfiles;

public class WorkspaceUserMappingProfile : Profile
{
    public WorkspaceUserMappingProfile()
    {
        // Get record
        CreateMap<WorkspaceUser, WorkspaceUserDto>();

        // Mapping for inserting or updating workspace user record
        CreateMap<WorkspaceUserDto, WorkspaceUser>();
    }
}