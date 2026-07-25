namespace AccountsAPIs.MappingProfiles;

public class AccountUsersTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get user record or list of user records
        config.NewConfig<AccountUser, AccountUsersTableDto>()
            .Map(dest => dest.UserRoles,
                src => src.UserRoles != null
                    ? src.UserRoles.Select(s => s.Role.FullName).ToList()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Get roles in SelectOption format
        config.NewConfig<AccountRole, SelectOption>()
            .Map(dest => dest.Label, src => src.FullName)
            .Map(dest => dest.Value, src => src.FullName)
            .Map(dest => dest.Description, src => src.Description);

        // Mapping for inserting or updating user record
        config.NewConfig<AccountUsersTableDto, AccountUser>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.UserRoles)
            .Ignore(dest => dest.EmailConfirmed)
            .Ignore(dest => dest.PwdSetOn)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}