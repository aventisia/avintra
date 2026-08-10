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
                    
        config.NewConfig<SpaceUser, SpaceUserDto>()
            .Map(dest => dest.Email, src => src.User != null ? src.User.Email : null)
            .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : null)
            .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : null);

        // Mapping for inserting or updating a space record.
        config.NewConfig<SpaceDto, Space>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .IgnoreNullValues(true);

        // Get spaces in SelectOption format
        config.NewConfig<Space, SelectOption>()
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Value, src => src.Id)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.IsDefault, src => src.IsDefault);
    }
}