namespace WorkspaceAPIs.MappingProfiles;

public class FlowCommentMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of comments to show on the UI.
        config.NewConfig<FlowComment, FlowCommentDto>()
            .Map(dest => dest.UserFullName, 
                src => src.User != null
                    ? src.User.FirstName + " " + src.User.LastName
                    : null)
            .Map(dest => dest.UserName, 
                src => src.User != null
                ? src.User.UserName
                : null)
            .Map(dest => dest.AvatarSrc, 
                src => src.User != null
                ? src.User.AvatarSrc
                : null)
            .Map(dest => dest.Initials, 
                src => src.User != null
                ? src.User.FirstName.Substring(0, 1) + src.User.LastName.Substring(0, 1)
                : null);

        // Mapping of DTO for inserting flow comment. Note: Update mapping is manual.
        config.NewConfig<FlowCommentDto, FlowComment>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsEdited)
            .IgnoreNullValues(true);
    }
}