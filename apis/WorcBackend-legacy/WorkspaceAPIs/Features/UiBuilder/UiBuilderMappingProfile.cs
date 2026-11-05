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
            .Ignore(nameof(UiBuilderProject.Instructions))
            .Ignore(nameof(UiBuilderProject.Theme))
            .Ignore(dest => dest.IsTemplate)
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
            .Ignore(nameof(UiBuilderVersion.Label))
            .Ignore(dest => dest.VersionNumber)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<UiBuilderAsset, UiBuilderAssetDto>()
            .Ignore(nameof(UiBuilderAssetDto.DataBase64));
    }
}
