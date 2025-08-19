namespace AccountsAPIs.MappingProfiles;

public class CreditUsageMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Map CreditsUsageDto to CreditUsage entity for data insertion
        config.NewConfig<CreditsUsageDto, CreditUsage>();
    }
}
