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
                .Map(dest => dest.Username, src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty)
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