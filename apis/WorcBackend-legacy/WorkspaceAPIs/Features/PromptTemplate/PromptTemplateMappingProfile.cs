namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between PromptTemplateTableDto 
/// and PromptTemplate entities using Mapster.
/// </summary>
public class PromptTemplateMappingProfile : IRegister
{
    // Registers the mappings between DTOs and entities for PromptTemplate.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating a PromptTemplate entity (from PromptTemplateTableDto to PromptTemplate)
        config.NewConfig<PromptTemplateTableDto, PromptTemplate>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting PromptTemplate record (from PromptTemplate to PromptTemplateTableDto)
        config.NewConfig<PromptTemplate, PromptTemplateTableDto>()
            .Map(dest => dest.CreatedBy, src =>
                src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src =>
                src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);

        // New Mapping for PromptTemplate to SelectOptionDto(For dropdowns or select lists)
        config.NewConfig<PromptTemplate, SelectOptionDto>()
                .Map(dest => dest.Value, src => src.Id)
                .Map(dest => dest.Label, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}