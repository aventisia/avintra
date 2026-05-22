namespace WorkspaceAPIs.MappingProfiles
{
     /// <summary>
     /// Mapping profile for ResourceShare and related entities using Mapster.
     /// </summary>
     public class ResourceShareMappingProfile : IRegister
     {
          public void Register(TypeAdapterConfig config)
          {
               // Map from ResourceShare entity to ResourceShareDto
               config.NewConfig<ResourceShare, ResourceShareDto>()
                   // Map recipient user details
                   .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                   .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)
                   .Map(dest => dest.Username, src => src.User != null ? src.User.UserName : string.Empty);

               // Map from ResourceShareDto to ResourceShare
               config.NewConfig<ResourceShareDto, ResourceShare>()
                   .Ignore(dest => dest.Id)       // Ignore ID when creating/updating
                   .Ignore(dest => dest.TenantId) // Ignore tenant ID, managed by service
                   .IgnoreNullValues(true);       // Ignore null values during mapping
          }
     }
}