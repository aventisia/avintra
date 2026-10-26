namespace WorkspaceAPIs.MappingProfiles
{
     /// <summary>
     /// Mapping profile for ResourceUserAccess and related entities using Mapster.
     /// </summary>
     public class ResourceUserAccessMappingProfile : IRegister
     {
          public void Register(TypeAdapterConfig config)
          {
               // Map from ResourceUserAccess entity to ResourceUserAccessDto
               config.NewConfig<ResourceUserAccess, ResourceUserAccessDto>()
                   // Map recipient user details
                   .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                   .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)
                   .Map(dest => dest.Username, src => src.User != null ? src.User.UserName : string.Empty);

               // Map from ResourceUserAccessDto to ResourceUserAccess
               config.NewConfig<ResourceUserAccessDto, ResourceUserAccess>()
                   .Ignore(dest => dest.Id)       // Ignore ID when creating/updating
                   .Ignore(dest => dest.TenantId) // Ignore tenant ID, managed by service
                   .IgnoreNullValues(true);       // Ignore null values during mapping
          }
     }
}