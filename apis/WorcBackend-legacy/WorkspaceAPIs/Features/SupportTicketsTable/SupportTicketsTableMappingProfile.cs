namespace WorkspaceAPIs.MappingProfiles;

public class SupportTicketsTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for support ticket record or records
        config.NewConfig<SupportTicket, SupportTicketsTableDto>()
            .Map(dest => dest.RemarkCount,
                src => src.SupportTicketRemarks != null
                    ? src.SupportTicketRemarks.Count
                    : 0)
            .Map(dest => dest.SupportTicketRemarks,
                src => src.SupportTicketRemarks != null
                    ? src.SupportTicketRemarks.Adapt<List<SupportTicketRemarksDto>>()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating support ticket record
        config.NewConfig<SupportTicketsTableDto, SupportTicket>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for updating support ticket status by reviewer
        config.NewConfig<STUpdateByReviewerDto, SupportTicket>()
            .Map(dest => dest.Id, src => src.TicketId)
            .Map(dest => dest.TicketNumber, src => src.TicketNumber)
            .Map(dest => dest.Status, src => src.Status)
            .IgnoreNullValues(true);
    }
}