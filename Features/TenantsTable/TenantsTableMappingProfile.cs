namespace AccountsAPIs.MappingProfiles;

public class TenantsTableMappingProfile : Profile
{
    public TenantsTableMappingProfile()
    {
        // Mapping profile to get list of tenant records
        CreateMap<Tenant, TenantsTableDto>();

        // Mapping profile to create or update tenant record
        CreateMap<TenantsTableDto, Tenant>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForMember(dest => dest.IsDisabled, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));
    }
}