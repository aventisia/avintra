namespace WorkspaceAPIs.MappingProfiles
{
     /// <summary>
     /// Mapping profile for FlowVersionUser and related entities using Mapster.
     /// </summary>
     public class FlowVersionUserMappingProfile : IRegister
     {
          public void Register(TypeAdapterConfig config)
          {
               // Map from FlowVersionUser entity to FlowVersionUserDto
               config.NewConfig<FlowVersionUser, FlowVersionUserDto>()
                   .Map(dest => dest.FirstName,
                        src => src.User != null ? src.User.FirstName : string.Empty)
                   .Map(dest => dest.LastName,
                        src => src.User != null ? src.User.LastName : string.Empty)
                   .Map(dest => dest.Username,
                        src => src.User != null ? src.User.UserName : string.Empty)
                   .Map(dest => dest.CreatedByUserInitials,
                        src => src.User != null
                            ? $"{src.User.FirstName.FirstOrDefault()}{src.User.LastName.FirstOrDefault()}"
                            : null)
                   .Map(dest => dest.Name,
                        src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : string.Empty)
                  .Map(dest => dest.VersionNumber,
                        src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
                   .Map(dest => dest.CreatedBy,
                        src => src.CreatedByUser != null
                            ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                            : null)
                   .Map(dest => dest.LastModifiedBy,
                        src => src.LastModifiedByUser != null
                            ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                            : null);

               // Map from FlowVersionUserDto to FlowVersionUser
               config.NewConfig<FlowVersionUserDto, FlowVersionUser>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .Ignore(dest => dest.TenantId)
                   .IgnoreNullValues(true);
          }
     }
}