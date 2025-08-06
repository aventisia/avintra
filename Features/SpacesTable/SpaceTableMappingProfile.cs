namespace AccountsAPIs.MappingProfiles;

public class SpaceTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for space record or records.
        config.NewConfig<Space, SpaceTableDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a space record.
        config.NewConfig<SpaceDto, Space>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .IgnoreNullValues(true);
                   
        // Get spaces in SelectOptionDto format
        config.NewConfig<Space, SelectOptionDto>()
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Value, src => src.Id)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}