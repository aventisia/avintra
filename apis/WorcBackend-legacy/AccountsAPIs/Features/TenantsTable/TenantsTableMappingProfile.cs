namespace AccountsAPIs.MappingProfiles;

public class TenantsTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping profile to get list of tenant records
        config.NewConfig<Tenant, TenantsTableDto>()
            .Ignore(dest => dest.DbUserId)
            .Ignore(dest => dest.DbPwd)
            .Ignore(dest => dest.DbHost)
            .Ignore(dest => dest.DbPort)
            .Ignore(dest => dest.DbNamePrefix);

        // Mapping profile to create or update tenant record
        config.NewConfig<TenantsTableDto, Tenant>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Get tenants in SelectOptionDto format
        config.NewConfig<Tenant, SelectOptionDto>()
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Value, src => src.Id);
    }
}