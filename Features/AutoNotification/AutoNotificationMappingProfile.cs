namespace WorkspaceAPIs.MappingProfiles;

public class AutoNotificationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping profile for Insert, Update (Same dto for both operations)
        config.NewConfig<AutoNotificationDto, Notification>();
    }
}