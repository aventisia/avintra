namespace WorkspaceAPIs.MappingProfiles;

public class TicketMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Ticket, TicketDto>()
            .Map(dest => dest.CommentCount,
                src => src.Comments != null ? src.Comments.Count : 0)
            .Map(dest => dest.AttachmentCount,
                src => src.Attachments != null ? src.Attachments.Count : 0)
            .Map(dest => dest.HistoryCount,
                src => src.History != null ? src.History.Count : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.Comments,
                src => src.Comments != null
                    ? src.Comments.Select(s => new TicketCommentDto()
                    {
                        Id = s.Id,
                        TicketId = s.TicketId,
                        Message = s.Message,
                        UserId = s.CreatedByUserId,
                        UserFullName = s.CreatedByUser != null
                            ? s.CreatedByUser.FirstName + " " + s.CreatedByUser.LastName
                            : null,
                        UserName = s.CreatedByUser != null
                            ? s.CreatedByUser.UserName
                            : null,
                        AvatarSrc = s.CreatedByUser != null
                            ? s.CreatedByUser.AvatarSrc
                            : null,
                        Initials = s.CreatedByUser != null
                            ? s.CreatedByUser.FirstName.Substring(0, 1) + s.CreatedByUser.LastName.Substring(0, 1)
                            : null,
                        IsEdited = s.IsEdited,
                        IsDisabled = s.IsDisabled,
                        CreatedOn = s.CreatedOn,
                        LastModifiedOn = s.LastModifiedOn
                    }).ToList()
                    : null)
            .Map(dest => dest.Attachments,
                src => src.Attachments != null
                    ? src.Attachments.Select(s => new TicketAttachmentDto()
                    {
                        Id = s.Id,
                        TicketId = s.TicketId,
                        FileName = s.FileName,
                        FilePath = s.FilePath,
                        FileSize = s.FileSize,
                        Extension = s.Extension,
                        UploadedByUserId = s.UploadedByUserId,
                        UploadedOn = s.UploadedOn
                    }).ToList()
                    : null);

        config.NewConfig<Ticket, TicketTableDto>()
            .Map(dest => dest.CommentCount,
                src => src.Comments != null ? src.Comments.Count : 0)
            .Map(dest => dest.AttachmentCount,
                src => src.Attachments != null ? src.Attachments.Count : 0)
            .Map(dest => dest.HistoryCount,
                src => src.History != null ? src.History.Count : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        config.NewConfig<TicketTableDto, Ticket>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.TicketNumber)
            .Ignore(dest => dest.Status)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsDisabled)
            .Ignore(dest => dest.Version)
            .IgnoreNullValues(true);

        config.NewConfig<TicketComment, TicketCommentDto>()
            .Map(dest => dest.UserId, src => src.CreatedByUserId)
            .Map(dest => dest.UserFullName,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.UserName,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.UserName
                    : null)
            .Map(dest => dest.AvatarSrc,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.AvatarSrc
                    : null)
            .Map(dest => dest.Initials,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName.Substring(0, 1) + src.CreatedByUser.LastName.Substring(0, 1)
                    : null);

        config.NewConfig<TicketCommentDto, TicketComment>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.CreatedByUser)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.LastModifiedByUser)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsEdited)
            .Ignore(dest => dest.IsDisabled)
            .Ignore(dest => dest.Ticket)
            .Ignore(dest => dest.Version)
            .IgnoreNullValues(true);

        config.NewConfig<TicketAttachmentDto, TicketAttachment>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.UploadedByUserId)
            .Ignore(dest => dest.UploadedOn)
            .Ignore(dest => dest.Ticket)
            .IgnoreNullValues(true);
    }
}
