namespace WorkspaceAPIs.MappingProfiles
{
    /// <summary>
    /// Mapping profile for QueueUser and related entities using Mapster.
    /// </summary>
    public class QueueUserMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Map from QueueUser entity to QueueUserDto
            config.NewConfig<QueueUser, QueueUserDto>()
                .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)
                .Map(dest => dest.Username, src => src.User != null ? src.User.UserName : string.Empty)
                .Map(dest => dest.CreatedByUserInitials,
                    src => src.User != null
                    ? src.User.FirstName.FirstOrDefault() + "" + src.User.LastName.FirstOrDefault()
                    : null)
                .Map(dest => dest.QueueName, src => src.Queue != null ? src.Queue.Name : string.Empty)
                .Map(dest => dest.CreatedBy,
                     src => src.CreatedByUser != null
                         ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                         : null)
                .Map(dest => dest.LastModifiedBy,
                     src => src.LastModifiedByUser != null
                         ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                         : null);

            // Map from QueueUserDto to QueueUser (used when inserting or updating records)
            config.NewConfig<QueueUserDto, QueueUser>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CreatedOn)
                .Ignore(dest => dest.LastModifiedOn)
                .Ignore(dest => dest.TenantId)
                .IgnoreNullValues(true);
        }
    }
}