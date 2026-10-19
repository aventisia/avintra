namespace WorkspaceAPIs.MappingProfiles;

public class UiBuilderMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<UiBuilderProject, UiBuilderProjectDto>()
            .Map(dest => dest.VersionCount,
                src => src.UiBuilderVersions != null ? src.UiBuilderVersions.Count : 0)
            .Map(dest => dest.HeadVersionNumber,
                src => src.UiBuilderVersions != null && src.UiBuilderVersions.Any()
                    ? src.UiBuilderVersions.Max(version => version.VersionNumber)
                    : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        config.NewConfig<UiBuilderProjectDto, UiBuilderProject>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.IsPublished)
            .Ignore(dest => dest.IsPublishedTenantWide)
            .Ignore(nameof(UiBuilderProject.PublishedVersionNumber))
            .Ignore(dest => dest.DataConnections)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<UiBuilderVersion, UiBuilderVersionDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);

        config.NewConfig<UiBuilderVersionDto, UiBuilderVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.VersionNumber)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<UiBuilderProjectUser, UiBuilderProjectUserDto>()
            .Map(dest => dest.FirstName,
                src => src.User != null ? src.User.FirstName : string.Empty)
            .Map(dest => dest.LastName,
                src => src.User != null ? src.User.LastName : string.Empty)
            .Map(dest => dest.Username,
                src => src.User != null ? src.User.UserName : string.Empty)
            .Map(dest => dest.Initials,
                src => src.User != null
                    ? $"{src.User.FirstName.FirstOrDefault()}{src.User.LastName.FirstOrDefault()}"
                    : null)
            .Map(dest => dest.Name,
                src => src.UiBuilderProject != null ? src.UiBuilderProject.Name : string.Empty)
            .Map(dest => dest.HeadVersionNumber,
                src => src.UiBuilderProject != null &&
                    src.UiBuilderProject.UiBuilderVersions != null &&
                    src.UiBuilderProject.UiBuilderVersions.Any()
                    ? src.UiBuilderProject.UiBuilderVersions.Max(version => version.VersionNumber)
                    : 0);

        config.NewConfig<UiBuilderProjectUserDto, UiBuilderProjectUser>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}
