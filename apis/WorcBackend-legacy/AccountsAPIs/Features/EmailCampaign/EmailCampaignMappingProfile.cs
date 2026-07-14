namespace AccountsAPIs.MappingProfiles;

public class EmailCampaignMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<EmailCampaign, EmailCampaignDto>()
            .Map(dest => dest.Cid, src => src.CampaignID)
            .Map(dest => dest.Rid, src => src.RecipientID)
            .IgnoreNullValues(true);

        config.NewConfig<EmailCampaignDto, EmailCampaign>()
            .Map(dest => dest.CampaignID, src => src.Cid)
            .Map(dest => dest.RecipientID, src => src.Rid)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}
