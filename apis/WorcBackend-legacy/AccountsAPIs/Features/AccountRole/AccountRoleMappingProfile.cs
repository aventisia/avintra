namespace AccountsAPIs.MappingProfiles;

public class AccountRoleMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get role record or list of roles
        config.NewConfig<AccountRole, AccountRoleDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);

        // Mapping for inserting or updating user record
        config.NewConfig<AccountRoleDto, AccountRole>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}