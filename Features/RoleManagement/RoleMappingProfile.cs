namespace AccountsAPIs.MappingProfiles;

public class RoleMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get role record or list of roles
        config.NewConfig<AccountRole, RoleDto>()
            .Map(dest => dest.TotalPermission, src => src.RolePermissions != null ? src.RolePermissions.Count() : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);
                    
        // Mapping for inserting or updating user record
        config.NewConfig<RoleDto, AccountRole>()
            .Ignore(dest => dest.RolePermissions)
            .Ignore(dest => dest.Seq)
            .IgnoreNullValues(true);
    }
}