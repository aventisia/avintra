namespace AccountsAPIs.MappingProfiles;

public class AddressMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<Address, AddressDto>()
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        config.NewConfig<AddressDto, Address>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.AddressRefId)
            .IgnoreNullValues(true);
    }
}