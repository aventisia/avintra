namespace AccountsAPIs.MappingProfiles;

public class SearchByQueryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AccountUser, SearchedUserDto>();
    }
}
