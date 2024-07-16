namespace WorkspaceAPIs.MappingProfiles;

public class FlowsTableMappingProfile : Profile
{
    public FlowsTableMappingProfile()
    {
        // Mapping for flow record or records.
        CreateMap<Flow, FlowsTableDto>()
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName))
            .ForMember(dest => dest.LastModifiedBy, opt => opt.MapFrom(src => src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName));

        // Mapping for inserting or updating a flow record.
        CreateMap<FlowsTableDto, Flow>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForMember(dest => dest.IsDisabled, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));
    }
}