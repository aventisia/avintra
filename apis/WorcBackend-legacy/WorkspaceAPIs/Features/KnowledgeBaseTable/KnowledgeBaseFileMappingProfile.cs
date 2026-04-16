namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Mapping profile for KnowledgeBaseFile entity to DTO conversions using Mapster.
/// </summary>
public class KnowledgeBaseFileMappingProfile : IRegister
{
    /// <summary>
    /// Registers mappings between KnowledgeBaseFile entity and DTO.
    /// </summary>
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<KnowledgeBaseFile, KnowledgeBaseFileDto>()
            .Map(dest => dest.FileSize, src => FormatFileSize(src.SizeInBytes))
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);
    }

    internal static string FormatFileSize(long bytes)
    {
        if (bytes < 1024)
            return $"{bytes} B";

        var kb = bytes / 1024d;
        if (kb < 1024)
            return $"{kb:0.#} KB";

        var mb = kb / 1024d;
        if (mb < 1024)
            return $"{mb:0.#} MB";

        var gb = mb / 1024d;
        return $"{gb:0.#} GB";
    }
}
