namespace AccountsAPIs.MappingProfiles;

public class BillingDetailMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<BillingDetail, BillingDetailDto>()
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.LastModifiedBy,
            src => src.LastModifiedByUser != null
            ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        config.NewConfig<BillingDetail, BillingAccountDetailsDto>()
                .Map(dest => dest.Name, src =>  $"Invoice_{src.CreatedOn:dd/MM/yyyy}")
                .Map(dest => dest.PaidOn, src => src.LastModifiedOn)
                .Map(dest => dest.Amount, src => src.Amount * src.TaxRate)
                .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
                .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        config.NewConfig<BillingDetailDto, BillingDetail>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}