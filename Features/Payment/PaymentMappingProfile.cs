namespace AccountsAPIs.MappingProfiles;

public class PaymentMappingProfile : IRegister
{
    public void Register (TypeAdapterConfig config)
    {
        // Mapping for inserting or updating payment Record.
        config.NewConfig<PaymentDto, Payment>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for retriving the payment Record.
        config.NewConfig<Payment ,PaymentDto>();
    }
}