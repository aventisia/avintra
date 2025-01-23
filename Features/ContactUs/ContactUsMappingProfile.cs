namespace AccountsAPIs.MappingProfiles;

public class ContactUsMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Response mapping for contact us record or records
        config.NewConfig<ContactUs, ContactUsDto>();

        // Request mapping to insert (NOT Update) contact us record
        config.NewConfig<ContactUsDto, ContactUs>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}