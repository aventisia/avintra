namespace AccountsAPIs.MappingProfiles;

public class PermissionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<Permission, PermissionDto>()
        .Map(dest => dest.CreatedBy, 
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        config.NewConfig<PermissionDto, Permission>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }
}