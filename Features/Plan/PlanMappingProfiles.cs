namespace AccountsAPIs.MappingProfiles;

public class PlanMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for insert-update plan record.
        config.NewConfig<PlanDto,Plan>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for get plan record.
        config.NewConfig<Plan,PlanDto>();
    }
}