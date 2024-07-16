namespace WorkspaceAPIs.MappingProfiles;

public class UnreadNotificationMappingProfile : Profile
{
    public UnreadNotificationMappingProfile()
    {
        // Get list of unread notifications for the user
        CreateMap<NotificationUser, UnreadNotificationDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.NotificationId))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.Notification.Message))
            .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => src.Notification.CreatedOn))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Notification.Type))
            .ForMember(dest => dest.ActionUrl, opt => opt.MapFrom(src => src.Notification.ActionUrl));
    }
}