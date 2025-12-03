namespace WorkspaceAPIs.MappingProfiles;

public class BlockMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of blocks to show on the UI.
        config.NewConfig<FlowVersion, BlockDto>()
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : string.Empty)
            .Map(dest => dest.Description, src => src.Flow != null ? src.Flow.Description : string.Empty)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        config.NewConfig<FlowVersion, SearchBlockDto>()
           .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : string.Empty)
           .Map(dest => dest.Description, src => src.Flow != null ? src.Flow.Description : string.Empty)
           .Map(dest => dest.FlowId, src => src.FlowId)
           .Map(dest => dest.CreatedBy,
               src => src.CreatedByUser != null
                   ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                   : null)
           .Map(dest => dest.LastModifiedBy,
               src => src.LastModifiedByUser != null
                   ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                   : null);

        // Mapping of DTO for inserting flow version. Note: Update mapping is manual.
        config.NewConfig<BlockDto, FlowVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}