namespace AccountsAPIs.MappingProfiles;

public class RoleManagementMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get role record or list of roles
        config.NewConfig<AccountRole, RoleManagementDto>()
            .Map(dest => dest.TenantId, src => src.Tenant != null ? src.TenantId : Guid.Empty)
            .Map(dest => dest.TenantName, src => src.Tenant != null ? src.Tenant.Name : null)
            .Map(dest => dest.TotalPermission, src => src.RolePermissions != null ? src.RolePermissions.Count() : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);

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
        config.NewConfig<RoleManagementDto, AccountRole>()
            .Ignore(dest => dest.RolePermissions)
            .Ignore(dest => dest.Seq)
            .IgnoreNullValues(true);
    }
}