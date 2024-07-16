namespace WorkspaceAPIs.MappingProfiles;

public class AutoNotificationMappingProfile : Profile
{
    public AutoNotificationMappingProfile()
    {
        // Mapping profile for Insert, Update (Same dto for both operations)
        CreateMap<AutoNotificationDto, Notification>();
    }
}