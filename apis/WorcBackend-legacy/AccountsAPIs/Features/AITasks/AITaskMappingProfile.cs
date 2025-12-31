namespace AccountsAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between AITaskTableDto 
/// and AITask entities using Mapster.
/// </summary>
public class AITaskMappingProfile : IRegister
{
    //Registers the mappings between DTOs and entities for AITask.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an AITask entity (from AITaskTableDto to AITask)
        config.NewConfig<AITaskTableDto, AITask>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting AITask record (from AITask to AITaskTableDto)
        config.NewConfig<AITask, AITaskTableDto>()
            .Map(dest => dest.CreatedBy, src =>
                src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src =>
                src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);
    }
}