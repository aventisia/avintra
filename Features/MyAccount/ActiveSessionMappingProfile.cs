namespace AccountsAPIs.MappingProfiles;

public class ActiveSessionMappingProfile:IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<ActiveSession,ActiveSessionDto>();
    }
}