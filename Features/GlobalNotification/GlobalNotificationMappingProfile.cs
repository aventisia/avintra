namespace WorkspaceAPIs.MappingProfiles;

public class GlobalNotificationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Response mapping for global notification record or records
        config.NewConfig<Notification, GlobalNotificationDto>();

        // Request mapping for inserting or updating a global notification record
        config.NewConfig<GlobalNotificationDto, Notification>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}