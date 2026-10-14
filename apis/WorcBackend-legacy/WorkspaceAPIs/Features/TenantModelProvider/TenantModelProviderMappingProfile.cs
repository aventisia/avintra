using WorkspaceAPIs.Features.TenantModelProvider.Helpers;

namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Defines the Mapster mappings between tenant model provider DTOs and entities.
/// </summary>
public class TenantModelProviderMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<TenantModelProviderDto, TenantModelProvider>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<TenantModelProvider, TenantModelProviderDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);

        config.NewConfig<EnabledModel, EnabledModelDto>()
            .Map(dest => dest.Capability, src => EnabledModelHelpers.ParseCapability(src.Capability));

        config.NewConfig<EnabledModelDto, EnabledModel>()
            .Map(dest => dest.Capability, src => src.Capability != null ? src.Capability.Value.ToString() : null);
    }
}
