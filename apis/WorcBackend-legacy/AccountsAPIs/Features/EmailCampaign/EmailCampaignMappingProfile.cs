namespace AccountsAPIs.MappingProfiles;

public class EmailCampaignMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<EmailCampaignDto, EmailCampaign>()
            .Map(dest => dest.CampaignID, src => src.Cid)
            .Map(dest => dest.RecipeintID, src => src.Rid)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}
