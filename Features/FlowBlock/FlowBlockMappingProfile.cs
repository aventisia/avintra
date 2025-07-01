namespace WorkspaceAPIs.MappingProfiles;

public class FlowBlockMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of blocks to show on the UI.
        config.NewConfig<FlowBlock, FlowBlockDto>()
            .Map(dest => dest.CreatedBy, 
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy, 
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping of DTO for inserting flow block. Note: Update mapping is manual.
        config.NewConfig<FlowBlockDto, FlowBlock>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}