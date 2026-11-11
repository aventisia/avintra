namespace AccountsAPIs.MappingProfiles;

public class PaymentMethodMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Configure mapping from PaymentMethod to PaymentMethodDto for retrieval operations.
        config.NewConfig<PaymentMethod, PaymentMethodDto>();

        // Configure mapping from PaymentMethodDto to PaymentMethod for insert/update operations.
        config.NewConfig<PaymentMethodDto, PaymentMethod>()
            .Ignore(dest => dest.Id) 
            .IgnoreNullValues(true); 
    }
}
