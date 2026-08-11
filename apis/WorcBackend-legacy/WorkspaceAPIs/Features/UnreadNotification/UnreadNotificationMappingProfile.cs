namespace WorkspaceAPIs.MappingProfiles;

public class UnreadNotificationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Get list of unread notifications for the user
        config.NewConfig<NotificationUser, UnreadNotificationDto>()
            .Map(dest => dest.Id, src => src.NotificationId)
            .Map(dest => dest.Title, src => src.Notification.Title)
            .Map(dest => dest.Message, src => src.Notification.Message)
            .Map(dest => dest.CreatedOn, src => src.Notification.CreatedOn)
            .Map(dest => dest.Type, src => src.Notification.Type)
            .Map(dest => dest.ActionUrl, src => src.Notification.ActionUrl);
    }
}