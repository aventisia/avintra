namespace WorkspaceAPIs.MappingProfiles;

public class SupportTicketRemarksMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of remarks to show on the UI.
        config.NewConfig<SupportTicketRemark, SupportTicketRemarksDto>()
            .Map(dest => dest.UserFullName, src => src.UserFullName)
            .Map(dest => dest.UserName, src => src.UserName)
            .Map(dest => dest.AvatarSrc, src => src.AvatarSrc)
            .Map(dest => dest.Initials, src => src.Initials)
            .Map(dest => dest.TicketNumber, src => src.TicketNumber);

        // Mapping of DTO for inserting support ticket remark. Note: Update mapping is manual.
        config.NewConfig<SupportTicketRemarksDto, SupportTicketRemark>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsEdited)
            .IgnoreNullValues(true);
    }
}