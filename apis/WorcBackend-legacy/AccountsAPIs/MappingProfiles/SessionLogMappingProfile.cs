namespace AccountsAPIs.MappingProfiles;

public class SessionLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Used while creating terminating active session to create session log
        // Used in AuthService.TerminateUserSessionsAsync method
        config.NewConfig<ActiveSession, SessionLog>();
    }
}