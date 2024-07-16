namespace WorkspaceAPIs.MappingProfiles;

public class FlowCommentMappingProfile : Profile
{
    public FlowCommentMappingProfile()
    {
        // Mapping of DTO to get list of comments to show on the UI.
        CreateMap<FlowComment, FlowCommentDto>()
            .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FirstName + " " + src.User.LastName))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.AvatarSrc, opt => opt.MapFrom(src => src.User.AvatarSrc))
            .ForMember(dest => dest.Initials, opt => opt.MapFrom(src => src.User.FirstName.Substring(0, 1) + src.User.LastName.Substring(0, 1)));

        // Mapping of DTO for inserting flow comment. Note: Update mapping is manual.
        CreateMap<FlowCommentDto, FlowComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForMember(dest => dest.IsEdited, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));
    }
}