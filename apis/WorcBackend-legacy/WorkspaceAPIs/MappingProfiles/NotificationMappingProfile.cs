namespace WorkspaceAPIs.MappingProfiles;

public class NotificationMappingProfile : IRegister
{
#pragma warning disable CS8603
    public void Register(TypeAdapterConfig config)
    {
        // Response mapping for a notification record or records
        config.NewConfig<Notification, NotificationDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null
                ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null
                ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                : null);

        // Request mapping for inserting a notification
        config.NewConfig<CreateNotificationDto, Notification>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsSystemGenerated)
            .IgnoreNullValues(true);

        // History mapping (per-recipient inbox row)
        config.NewConfig<NotificationUser, NotificationHistoryDto>()
            .Map(dest => dest.NotificationId, src => src.NotificationId)
            .Map(dest => dest.Title, src => src.Notification.Title)
            .Map(dest => dest.Message, src => src.Notification.Message)
            .Map(dest => dest.Type, src => src.Notification.Type)
            .Map(dest => dest.SourceType, src => src.Notification.SourceType)
            .Map(dest => dest.ActionUrl, src => src.Notification.ActionUrl)
            .Map(dest => dest.CreatedOn, src => src.Notification.CreatedOn);
    }
#pragma warning restore CS8603
}
