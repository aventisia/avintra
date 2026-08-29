namespace WorkspaceAPIs.MappingProfiles;

public class SaNotificationMappingProfile : IRegister
{
#pragma warning disable CS8603
    public void Register(TypeAdapterConfig config)
    {
        // Response mapping for a Super Admin notification record or records
        config.NewConfig<Notification, SaNotificationDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null
                ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null
                ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                : null);

        // Request mapping for inserting a Super Admin notification
        config.NewConfig<CreateSaNotificationDto, Notification>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.RefId)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsSystemGenerated)
            .Ignore(dest => dest.IsSuperAdminNotification)
            .IgnoreNullValues(true);
    }
#pragma warning restore CS8603
}
