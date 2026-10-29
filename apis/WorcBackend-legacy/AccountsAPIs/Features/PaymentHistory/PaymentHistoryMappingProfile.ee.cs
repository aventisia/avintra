namespace AccountsAPIs.MappingProfiles;

public class PaymentHistoryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {

        // Configure mapping from PaymentHistory to PaymentHistoryDto for retrieval operations.
        config.NewConfig<PaymentHistory, PaymentHistoryDto>();

        // Configure mapping from PaymentHistoryDto to PaymentHistory for insert/update operations.
        config.NewConfig<PaymentHistoryDto, PaymentHistory>()
            .Ignore(dest => dest.Id) 
            .IgnoreNullValues(true);
    }
}
