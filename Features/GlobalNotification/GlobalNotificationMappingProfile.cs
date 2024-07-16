namespace WorkspaceAPIs.MappingProfiles;

public class GlobalNotificationMappingProfile : Profile
{
    public GlobalNotificationMappingProfile()
    {
        // Response mapping for global notification record or records
        CreateMap<Notification, GlobalNotificationDto>();

        // Request mapping for inserting or updating a global notification record
        CreateMap<GlobalNotificationDto, Notification>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsDisabled, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));

    }
}