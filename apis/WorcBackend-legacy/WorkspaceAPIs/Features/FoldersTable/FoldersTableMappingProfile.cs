namespace WorkspaceAPIs.MappingProfiles;

public class FoldersTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Folder, FoldersTableRowDto>()
            .Ignore(dest => dest.FlowCount)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);
    }
}
