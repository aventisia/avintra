namespace AccountsAPIs.MappingProfiles;

public class SessionLogMappingProfile : Profile
{
    public SessionLogMappingProfile()
    {
        // Used while createing terminating active session to create session log
        // Used in AuthService.TerminateUserSessionsAsync method
        CreateMap<ActiveSession, SessionLog>();
    }
}