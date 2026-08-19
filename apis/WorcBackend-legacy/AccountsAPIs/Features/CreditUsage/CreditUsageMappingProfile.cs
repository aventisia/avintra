using AccountsAPIs.Helpers;

namespace AccountsAPIs.MappingProfiles;

public class CreditUsageMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Map CreditsUsageDto to CreditUsage entity for data insertion
        config.NewConfig<CreditsUsageDto, CreditUsage>();
        config.NewConfig<CreditUsage, ExportCreditUsageResponseDto>()
            .Map(dest => dest.UsedOn, src => src.UsedAt.Date.ToString("dd/MM/yyyy"))
            .Map(dest => dest.CreditsUsed, src => CreditRoundingHelper.RoundToTwo(src.CreditsUsed))
            .Map(dest => dest.UnitUsed, src => CreditRoundingHelper.RoundToTwo(src.UnitUsed))
            .Map(dest => dest.Username, src => src.UsedByUser != null ? $"{src.UsedByUser.FirstName} {src.UsedByUser.LastName} {src.UsedByUser.UserName}" : null);
    }
}
