namespace AccountsAPIs.MappingProfiles;

public class TenantRoleManagementMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AccountRole, TenantRoleDto>()
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
        config.NewConfig<TenantRoleDto, AccountRole>()
            .Ignore(dest => dest.RolePermissions)
            .Ignore(dest => dest.Seq)
            .IgnoreNullValues(true);
    }
}